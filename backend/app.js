const express = require("express");
const cors = require("cors");
const { Op } = require("sequelize");


const {
    sequelize,
    Rol,
    Persona,
    Usuario,
    Especialidad,
    Profesional,
    Horario,
    Sala,
    Paciente,
    Atencion,
    Turno,
} = require("./modelos");

const app = express();
const DURACION_TURNO_MINUTOS = 30;

app.use(cors());
app.use(express.json());


// ==================== ROLES ====================

app.post("/rol", async (req, res) => {
    try {
        const rol = await Rol.create(req.body);
        res.status(201).json(rol);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/roles", async (req, res) => {
    try {
        const roles = await Rol.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});


// ==================== PERSONAS ====================

app.post("/personas", async (req, res) => {
    try {
        const persona = await Persona.create(req.body);
        res.status(201).json(persona);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/personas", async (req, res) => {
    try {
        const personas = await Persona.findAll();
        res.json(personas);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});


// ==================== USUARIOS ====================

app.post("/usuarios", async (req, res) => {
    try {

        // Creamos el usuario
        const usuario = await Usuario.create(req.body);

        // Si el rol es Paciente (id_rol = 2),
        // creamos automáticamente el paciente
        if (usuario.id_rol === 2) {

            await Paciente.create({
                id_persona: usuario.id_persona,
                historial: "Sin antecedentes relevantes",
                obra_social: "Sin obra social",
                condicion: "Estable",
                numero_turno: null
            });

        }

        res.status(201).json(usuario);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
});

app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [Persona, Rol]
        });

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/profesional/persona/:id_persona",async (req, res) => {

        try {

            const profesional =
                await Profesional.findOne({
                    where: {
                        id_persona:
                        req.params.id_persona
                    }
                });

            if (!profesional) {

                return res.status(404).json({
                    mensaje:
                    "Profesional no encontrado"
                });

            }

            res.json(profesional);

        }
        catch (error) {

            res.status(500).json({
                mensaje: error.message
            });

        }

    }
);

app.post("/especialidades", async (req, res) => {
    try {
        const especialidad = await Especialidad.create(req.body);
        res.status(201).json(especialidad);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/especialidades", async (req, res) => {
    try {
        const especialidades = await Especialidad.findAll();

        res.json(especialidades);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.post("/profesional", async (req, res) => {
    try {
        const profesional = await Profesional.create(req.body);

        res.status(201).json(profesional);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/profesional", async (req, res) => {
    try {
        const profesionales = await Profesional.findAll({
            include: [Especialidad, Persona]
        });

        res.json(profesionales);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.post("/horario", async (req, res) => {
    try {
        const idProfesional = Number(req.body.id_profesional);
        const { dia, hora_inicio, hora_fin } = req.body;
        const diasValidos = [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ];
        const formatoHoraValido = (hora) =>
            typeof hora === "string" &&
            /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(hora);

        if (
            !Number.isInteger(idProfesional) ||
            idProfesional <= 0 ||
            !diasValidos.includes(dia) ||
            !formatoHoraValido(hora_inicio) ||
            !formatoHoraValido(hora_fin)
        ) {
            return res.status(400).json({
                mensaje: "Profesional, día y rango horario válidos son obligatorios"
            });
        }

        const minutosDesdeMedianoche = (hora) => {
            const [horas, minutos] = hora.split(":").map(Number);
            return horas * 60 + minutos;
        };
        const inicioNuevo = minutosDesdeMedianoche(hora_inicio);
        const finNuevo = minutosDesdeMedianoche(hora_fin);

        if (inicioNuevo >= finNuevo) {
            return res.status(400).json({
                mensaje: "La hora de fin debe ser posterior a la hora de inicio"
            });
        }

        const profesional = await Profesional.findByPk(idProfesional);

        if (!profesional) {
            return res.status(404).json({
                mensaje: "El profesional no existe"
            });
        }

        const horariosDelDia = await Horario.findAll({
            where: {
                id_profesional: idProfesional,
                dia,
                disponible: true
            }
        });
        const haySuperposicion = horariosDelDia.some((horario) => {
            const inicioExistente = minutosDesdeMedianoche(horario.hora_inicio);
            const finExistente = minutosDesdeMedianoche(horario.hora_fin);

            return inicioNuevo < finExistente && finNuevo > inicioExistente;
        });

        if (haySuperposicion) {
            return res.status(409).json({
                mensaje: "Ese horario se superpone con otro horario del mismo día"
            });
        }

        const horario = await Horario.create({
            id_profesional: idProfesional,
            dia,
            hora_inicio,
            hora_fin,
            disponible: true
        });

        res.status(201).json(horario);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/horario", async (req, res) => {
    try {
        const horarios = await Horario.findAll({
            include: [Profesional]
        });

        res.json(horarios);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/horario/profesional/:id_profesional", async (req, res) => {
    try {
        const idProfesional = Number(req.params.id_profesional);

        if (!Number.isInteger(idProfesional) || idProfesional <= 0) {
            return res.status(400).json({
                mensaje: "El identificador del profesional no es válido"
            });
        }

        const horarios = await Horario.findAll({
            where: {
                id_profesional: idProfesional
            },
            order: [
                ["dia", "ASC"],
                ["hora_inicio", "ASC"]
            ]
        });

        res.json(horarios);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/horario/:id", async (req, res) => {

    try {

        const horario = await Horario.findByPk(req.params.id);

        if (!horario) {

            return res.status(404).json({
                mensaje: "Horario no encontrado"
            });

        }

        res.json(horario);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

});

app.post("/salas", async (req, res) => {
    try {
        const sala = await Sala.create(req.body);

        res.status(201).json(sala);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/salas", async (req, res) => {
    try {
        const salas = await Sala.findAll({
            include: [Horario]
        });

        res.json(salas);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.post("/pacientes", async (req, res) => {
    try {
        const paciente = await Paciente.create(req.body);

        res.status(201).json(paciente);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/pacientes", async (req, res) => {
    try {
        const pacientes = await Paciente.findAll({
            include: [Persona]
        });

        res.json(pacientes);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/pacientes/:id_persona", async (req, res) => {

    try {

        const paciente = await Paciente.findOne({
            where: {
                id_persona: req.params.id_persona
            },
            include: [Persona]
        });

        if (!paciente) {

            return res.status(404).json({
                mensaje: "Paciente no encontrado"
            });

        }

        res.json(paciente);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

});

app.post("/atenciones", async (req, res) => {
    try {
        const atencion = await Atencion.create(req.body);

        res.status(201).json(atencion);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/atenciones", async (req, res) => {
    try {
        const atenciones = await Atencion.findAll({
            include: [Paciente, Profesional]
        });

        res.json(atenciones);

    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.post("/turnos", async (req, res) => {

    try {

        const idPaciente = Number(req.body.id_paciente);
        const idHorario = Number(req.body.id_horario);
        const { fecha_turno } = req.body;

        if (
            !Number.isInteger(idPaciente) ||
            idPaciente <= 0 ||
            !Number.isInteger(idHorario) ||
            idHorario <= 0 ||
            !fecha_turno
        ) {
            return res.status(400).json({
                mensaje: "Paciente, horario y fecha son obligatorios"
            });
        }

        // 1. Buscamos el horario
        const horario = await Horario.findByPk(idHorario);

        if (!horario) {
            return res.status(404).json({
                mensaje: "El horario no existe"
            });
        }

        // 2. Comprobamos que el horario esté disponible
        if (!horario.disponible) {
            return res.status(400).json({
                mensaje: "El horario no está disponible"
            });
        }

        // 3. Comprobamos que el paciente exista
        const paciente = await Paciente.findByPk(idPaciente);

        if (!paciente) {
            return res.status(404).json({
                mensaje: "El paciente no existe"
            });
        }

        // Convertimos la fecha recibida
        const fecha = new Date(fecha_turno);

        if (isNaN(fecha.getTime())) {
            return res.status(400).json({
                mensaje: "La fecha del turno no es válida"
            });
        }

        if (fecha <= new Date()) {
            return res.status(400).json({
                mensaje: "La fecha del turno debe ser futura"
            });
        }

        // 4. Cada turno ocupa un bloque de 30 minutos.
        if (
            fecha.getMinutes() % DURACION_TURNO_MINUTOS !== 0 ||
            fecha.getSeconds() !== 0 ||
            fecha.getMilliseconds() !== 0
        ) {
            return res.status(400).json({
                mensaje: "Los turnos deben comenzar cada 30 minutos"
            });
        }

        // 5. Comprobamos que la fecha corresponda al día del horario
        const dias = [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado"
        ];

        const diaTurno = dias[fecha.getDay()];

        if (diaTurno !== horario.dia) {
            return res.status(400).json({
                mensaje: `El horario corresponde al día ${horario.dia}`
            });
        }

        // 6. El turno completo debe quedar dentro del horario profesional.
        const minutosDesdeMedianoche = (hora) => {
            const [horas, minutos] = hora.split(":").map(Number);
            return horas * 60 + minutos;
        };
        const inicioTurno = fecha.getHours() * 60 + fecha.getMinutes();
        const finTurno = inicioTurno + DURACION_TURNO_MINUTOS;
        const inicioHorario = minutosDesdeMedianoche(horario.hora_inicio);
        const finHorario = minutosDesdeMedianoche(horario.hora_fin);

        if (
            inicioTurno < inicioHorario ||
            finTurno > finHorario
        ) {
            return res.status(400).json({
                mensaje: `El turno de ${DURACION_TURNO_MINUTOS} minutos debe quedar entre ${horario.hora_inicio} y ${horario.hora_fin}`
            });
        }

        const duracionTurnoMs = DURACION_TURNO_MINUTOS * 60 * 1000;
        const finNuevoTurno = new Date(fecha.getTime() + duracionTurnoMs);
        const inicioMinimoExistente = new Date(fecha.getTime() - duracionTurnoMs);

        // Serializamos las reservas del profesional para evitar cruces concurrentes.
        const turno = await sequelize.transaction(async (transaction) => {
            await sequelize.query(
                "SELECT pg_advisory_xact_lock(CAST(:idProfesional AS BIGINT))",
                {
                    replacements: {
                        idProfesional: horario.id_profesional
                    },
                    transaction
                }
            );

            const turnoSuperpuesto = await Turno.findOne({
                where: {
                    fecha_turno: {
                        [Op.gt]: inicioMinimoExistente,
                        [Op.lt]: finNuevoTurno
                    }
                },
                include: [{
                    model: Horario,
                    where: {
                        id_profesional: horario.id_profesional
                    }
                }],
                transaction
            });

            if (turnoSuperpuesto) {
                const error = new Error(
                    "Ese horario ya esta reservado, por favor elije otro horario"
                );
                error.name = "TurnoSuperpuestoError";
                throw error;
            }

            return Turno.create({
                id_paciente: idPaciente,
                id_horario: idHorario,
                fecha_turno: fecha
            }, { transaction });
        });

        res.status(201).json(turno);

    } catch (error) {
        if (error.name === "TurnoSuperpuestoError") {
            return res.status(409).json({
                mensaje: error.message
            });
        }

        res.status(500).json({
            mensaje: error.message
        });

    }

});

app.get("/turnos/paciente/:id_paciente", async (req, res) => {
    try {
        const idPaciente = Number(req.params.id_paciente);

        if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
            return res.status(400).json({
                mensaje: "El identificador del paciente no es válido"
            });
        }

        const turnos = await Turno.findAll({
            where: {
                id_paciente: idPaciente
            },
            include: [Horario],
            order: [["fecha_turno", "ASC"]]
        });

        res.json(turnos);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

app.get("/turnos/profesional/:id_profesional", async (req, res) => {
    try {
        const idProfesional = Number(req.params.id_profesional);

        if (!Number.isInteger(idProfesional) || idProfesional <= 0) {
            return res.status(400).json({
                mensaje: "El identificador del profesional no es válido"
            });
        }

        const turnos = await Turno.findAll({
            include: [
                {
                    model: Horario,
                    where: {
                        id_profesional: idProfesional
                    }
                },
                {
                    model: Paciente,
                    include: [Persona]
                }
            ],
            order: [["fecha_turno", "ASC"]]
        });

        res.json(turnos);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});


app.get("/turnos", async (req, res) => {
    try {

        const turnos = await Turno.findAll({
            include: [Paciente, Horario]
        });

        res.json(turnos);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
});

app.delete("/turnos/:id", async (req, res) => {

    try {
        const idPaciente = Number(req.query.id_paciente);

        if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
            return res.status(400).json({
                mensaje: "Se necesita un identificador de paciente válido"
            });
        }

        const turno = await Turno.findByPk(req.params.id);

        if (!turno) {

            return res.status(404).json({
                mensaje: "Turno no encontrado"
            });
        }

        if (turno.id_paciente !== idPaciente) {
            return res.status(403).json({
                mensaje: "No puedes cancelar un turno de otro paciente"
            });
        }

        await turno.destroy();

        res.json({
            mensaje: "Turno cancelado correctamente"
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

});

app.post("/login", async (req, res) => {
    try {

        const { nombre, contraseña } = req.body;

        const usuario = await Usuario.findOne({
            where: {
                nombre: nombre,
                contraseña: contraseña
            },
            include: [Persona, Rol]
        });

        if (!usuario) {
            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos"
            });
        }

        const paciente = await Paciente.findOne({
            where: {
                id_persona: usuario.id_persona
            }
        });

        res.json({
            mensaje: "Login correcto",
            usuario: usuario.nombre,
            rol: usuario.Rol.tipo_rol,
            persona: usuario.Persona,
            id_paciente: paciente ? paciente.id_paciente : null
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
});

// | INICIAR SERVIDOR ====================

sequelize.sync({ alter: true })
    .then(() => {

        console.log("Base sincronizada");

        app.listen(3001, () => {
            console.log("Servidor en puerto 3001");
        });

    })
    .catch(error => {
        console.log(error);
    });
const express = require("express");
const cors = require("cors");


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
        const horario = await Horario.create(req.body);

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

        const { id_paciente, id_horario, fecha_turno } = req.body;

        // 1. Buscamos el horario
        const horario = await Horario.findByPk(id_horario);

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
        const paciente = await Paciente.findByPk(id_paciente);

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

        // 4. Comprobamos que la fecha corresponda al día del horario
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

        // 5. Comprobamos que la hora esté dentro del horario
        const horaTurno = fecha.toTimeString().substring(0, 8);

        if (
            horaTurno < horario.hora_inicio ||
            horaTurno >= horario.hora_fin
        ) {
            return res.status(400).json({
                mensaje: `La hora debe estar entre ${horario.hora_inicio} y ${horario.hora_fin}`
            });
        }

        // 6. Comprobamos que no exista otro turno en esa misma fecha y hora
        const turnoExistente = await Turno.findOne({
            where: {
                id_horario: id_horario,
                fecha_turno: fecha
            }
        });

        if (turnoExistente) {
            return res.status(400).json({
                mensaje: "Ese horario ya está ocupado"
            });
        }

        // 7. Creamos el turno
        const turno = await Turno.create({
            id_paciente,
            id_horario,
            fecha_turno: fecha
        });

        res.status(201).json(turno);

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

        const turno = await Turno.findByPk(
            req.params.id
        );

        if (!turno) {

            return res.status(404).json({
                mensaje: "Turno no encontrado"
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

        res.json({
            mensaje: "Login correcto",
            usuario: usuario.nombre,
            rol: usuario.Rol.tipo_rol,
            persona: usuario.Persona
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
const express = require("express");
const cors = require("cors");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Falta JWT_SECRET (mínimo 32 caracteres) en .env");
}



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

// Genera bloques individuales de 30 minutos dentro de una jornada.
// No borra horarios anteriores ni turnos reservados.
app.post("/horarios/generar", async (req, res) => {
    const idProfesional = Number(req.body.id_profesional);
    const { dia, hora_inicio, hora_fin } = req.body;
    const cantidad = Number(req.body.cantidad_turnos);
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const formatoHora = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    const aMinutos = (hora) => {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    };
    const aHora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const PASO = 5;

    if (!Number.isInteger(idProfesional) || idProfesional <= 0 ||
        !dias.includes(dia) ||
        typeof hora_inicio !== "string" || !formatoHora.test(hora_inicio) ||
        typeof hora_fin !== "string" || !formatoHora.test(hora_fin) ||
        !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 288) {
        return res.status(400).json({ mensaje: "Ingresá un profesional, día, horario y cantidad válidos." });
    }
    const inicio = aMinutos(hora_inicio);
    const fin = aMinutos(hora_fin);
    const minutosJornada = fin - inicio;
    if (minutosJornada < PASO || inicio % PASO !== 0 || fin % PASO !== 0) {
        return res.status(400).json({ mensaje: "La jornada debe ser posterior al inicio y usar múltiplos de 5 minutos." });
    }
    const totalBloques = minutosJornada / PASO;
    if (cantidad > totalBloques) {
        return res.status(400).json({
            mensaje: `En esa jornada entran como máximo ${totalBloques} turnos de ${PASO} minutos.`
        });
    }

    // Duración estimada por consulta: se redondea hacia abajo a múltiplos de 5.
    // Los minutos restantes se reparten como pausas entre los turnos.
    const bloquesPorConsulta = Math.floor(totalBloques / cantidad);
    const duracionMinutos = bloquesPorConsulta * PASO;
    const bloquesLibres = totalBloques - bloquesPorConsulta * cantidad;
    const nuevos = Array.from({ length: cantidad }, (_, i) => {
        const pausaAcumulada = cantidad === 1 ? 0 :
            Math.round(i * bloquesLibres / (cantidad - 1));
        const desde = inicio + (i * bloquesPorConsulta + pausaAcumulada) * PASO;
        return {
            id_profesional: idProfesional,
            dia,
            hora_inicio: aHora(desde),
            hora_fin: aHora(desde + duracionMinutos),
            disponible: true
        };
    });

    try {
        const creados = await sequelize.transaction(async (transaction) => {
            await sequelize.query(
                "SELECT pg_advisory_xact_lock(CAST(:idProfesional AS BIGINT))",
                { replacements: { idProfesional }, transaction }
            );
            const profesional = await Profesional.findByPk(idProfesional, { transaction });
            if (!profesional) {
                const error = new Error("El profesional no existe.");
                error.status = 404;
                throw error;
            }
            const existentes = await Horario.findAll({
                where: { id_profesional: idProfesional, dia, disponible: true },
                transaction
            });
            const hayCruce = nuevos.some(nuevo => existentes.some(existente =>
                aMinutos(nuevo.hora_inicio) < aMinutos(existente.hora_fin) &&
                aMinutos(nuevo.hora_fin) > aMinutos(existente.hora_inicio)
            ));
            if (hayCruce) {
                const error = new Error("Ya hay horarios activos que se superponen ese día. No se guardó ninguno.");
                error.status = 409;
                throw error;
            }
            return Horario.bulkCreate(nuevos, { transaction });
        });
        res.status(201).json({
            mensaje: `${creados.length} turnos generados de aproximadamente ${duracionMinutos} minutos cada uno.`,
            duracion_minutos: duracionMinutos,
            horarios: creados
        });
    } catch (error) {
        console.error("Error al generar horarios:", error);
        res.status(error.status || 500).json({
            mensaje: error.status ? error.message : "No se pudieron generar los horarios."
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
                id_profesional: idProfesional,
                disponible: true
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

// Retira un horario de la agenda sin perder el registro histórico.
// Si ya hay turnos vinculados, se impide retirarlo para no afectar reservas.
// ==========================================
// QUITAR HORARIO DEL PROFESIONAL
// ==========================================

app.delete("/horario/:id", async (req, res) => {

    const idHorario = Number(req.params.id);
    const idProfesional = Number(req.query.id_profesional);

    if (
        !Number.isInteger(idHorario) ||
        idHorario <= 0 ||
        !Number.isInteger(idProfesional) ||
        idProfesional <= 0
    ) {
        return res.status(400).json({
            mensaje: "Horario y profesional válidos son obligatorios."
        });
    }

    try {

        await sequelize.transaction(async (transaction) => {

            // Bloquear modificaciones simultáneas
            await sequelize.query(
                "SELECT pg_advisory_xact_lock(CAST(:idProfesional AS BIGINT))",
                {
                    replacements: { idProfesional },
                    transaction
                }
            );

            // Buscar el horario
            const horario = await Horario.findByPk(idHorario, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (
                !horario ||
                Number(horario.id_profesional) !== idProfesional ||
                !horario.disponible
            ) {
                const error = new Error(
                    "No se encontró ese horario activo."
                );

                error.status = 404;
                throw error;
            }

            // Buscar reservas que todavía NO están finalizadas
            const reservasPendientes = await Turno.count({

                where: {

                    id_horario: idHorario,

                    estado: {
                        [Op.notIn]: [
                            "atendido",
                            "no_asistio"
                        ]
                    }

                },

                transaction

            });

            // Si existen reservas pendientes, no permitir quitarlo
            if (reservasPendientes > 0) {

                const error = new Error(
                    `Este horario tiene ${reservasPendientes} ` +
                    `turno(s) pendiente(s). ` +
                    "Primero debés resolver esas reservas."
                );

                error.status = 409;
                throw error;
            }

            // Desactivar el horario
            // Sin borrar el historial médico
            await horario.update(
                {
                    disponible: false
                },
                {
                    transaction
                }
            );

        });

        res.json({
            mensaje:
                "Horario quitado correctamente. " +
                "Las atenciones anteriores se conservaron."
        });

    } catch (error) {

        console.error("Error al quitar horario:", error);

        res.status(error.status || 500).json({

            mensaje: error.status
                ? error.message
                : "No se pudo quitar el horario."

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

// ==========================================
// REGISTRAR ATENCIÓN MÉDICA
// ==========================================

app.post("/atenciones", async (req, res) => {

    try {

        const {
            id_turno,
            motivo_consulta,
            diagnostico,
            observacion,
            indicaciones
        } = req.body;

        const idTurno = Number(id_turno);

        // Validar identificador
        if (!Number.isInteger(idTurno) || idTurno <= 0) {

            return res.status(400).json({
                mensaje: "El turno no es válido"
            });

        }

        // Buscar turno con su horario
        const turno = await Turno.findByPk(idTurno, {
            include: [Horario]
        });

        if (!turno || !turno.Horario) {

            return res.status(404).json({
                mensaje: "Turno no encontrado"
            });

        }

        // Solo registrar consultas iniciadas o finalizadas
        if (
            turno.estado !== "en_consulta" &&
            turno.estado !== "atendido"
        ) {

            return res.status(400).json({
                mensaje: "Primero debe iniciarse la consulta"
            });

        }

        // Evitar atenciones duplicadas
        const existente = await Atencion.findOne({
            where: {
                id_turno: idTurno
            }
        });

        if (existente) {

            return res.status(409).json({
                mensaje: "Este turno ya tiene una atención registrada"
            });

        }

        // Validar campos obligatorios
        if (
            typeof motivo_consulta !== "string" ||
            !motivo_consulta.trim() ||
            typeof diagnostico !== "string" ||
            !diagnostico.trim()
        ) {

            return res.status(400).json({
                mensaje: "Completá el motivo de consulta y el diagnóstico"
            });

        }

        // Crear atención médica
        const atencion = await Atencion.create({

            id_turno: idTurno,

            id_paciente: turno.id_paciente,

            id_profesional: turno.Horario.id_profesional,

            motivo_consulta: motivo_consulta.trim(),

            diagnostico: diagnostico.trim(),

            observacion:
                typeof observacion === "string"
                    ? observacion.trim()
                    : "",

            indicaciones:
                typeof indicaciones === "string"
                    ? indicaciones.trim()
                    : "",

            fecha_atencion: new Date()

        });

        res.status(201).json({

            mensaje: "Atención médica registrada correctamente",

            atencion: atencion

        });

    } catch (error) {

        console.error("Error al registrar atención:", error);

        if (
            error.name === "SequelizeUniqueConstraintError"
        ) {

            return res.status(409).json({
                mensaje: "Este turno ya tiene una atención registrada"
            });

        }

        res.status(500).json({
            mensaje: "No se pudo registrar la atención médica"
        });

    }

});

// ==========================================
// HISTORIAL DE ATENCIONES DE UN PACIENTE
// ==========================================

app.get("/atenciones/paciente/:id_paciente", async (req, res) => {

    try {

        const idPaciente = Number(req.params.id_paciente);
        const idProfesional = Number(req.query.id_profesional);

        // Validar identificadores
        if (
            !Number.isInteger(idPaciente) ||
            idPaciente <= 0 ||
            !Number.isInteger(idProfesional) ||
            idProfesional <= 0
        ) {

            return res.status(400).json({
                mensaje: "Identificadores no válidos"
            });

        }

        // Buscar atenciones del paciente con este profesional
        const atenciones = await Atencion.findAll({

            where: {
                id_paciente: idPaciente,
                id_profesional: idProfesional
            },

            order: [
                ["fecha_atencion", "DESC"]
            ]

        });

        res.json(atenciones);

    } catch (error) {

        console.error("Error al consultar historial:", error);

        res.status(500).json({
            mensaje: "No se pudo consultar el historial médico"
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
        const fecha = new Date(req.body.fecha_turno);
        if (!Number.isInteger(idPaciente) || idPaciente <= 0 ||
            !Number.isInteger(idHorario) || idHorario <= 0 ||
            !req.body.fecha_turno || Number.isNaN(fecha.getTime())) {
            return res.status(400).json({ mensaje: "Paciente, horario y fecha válidos son obligatorios." });
        }
        if (fecha <= new Date() || fecha.getSeconds() !== 0 || fecha.getMilliseconds() !== 0) {
            return res.status(400).json({ mensaje: "Seleccioná un turno futuro válido." });
        }
        const [horario, paciente] = await Promise.all([
            Horario.findByPk(idHorario), Paciente.findByPk(idPaciente)
        ]);
        if (!horario || !horario.disponible) {
            return res.status(404).json({ mensaje: "El horario no existe o fue desactivado." });
        }
        if (!paciente) {
            return res.status(404).json({ mensaje: "El paciente no existe." });
        }
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        if (dias[fecha.getDay()] !== horario.dia) {
            return res.status(400).json({ mensaje: `El horario corresponde al día ${horario.dia}.` });
        }
        const aMinutos = (hora) => {
            const [h, m] = hora.split(":").map(Number);
            return h * 60 + m;
        };
        const inicioBloque = aMinutos(horario.hora_inicio);
        const finBloque = aMinutos(horario.hora_fin);
        const minutosFecha = fecha.getHours() * 60 + fecha.getMinutes();
        // Impide que el paciente invente una hora dentro del bloque.
        if (minutosFecha !== inicioBloque || finBloque <= inicioBloque) {
            return res.status(400).json({ mensaje: "Elegí uno de los horarios definidos por el profesional." });
        }
        const finNuevo = new Date(fecha.getTime() + (finBloque - inicioBloque) * 60000);
        const comienzoDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        const finDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1);

        const turno = await sequelize.transaction(async transaction => {
            await sequelize.query(
                "SELECT pg_advisory_xact_lock(CAST(:idProfesional AS BIGINT))",
                { replacements: { idProfesional: horario.id_profesional }, transaction }
            );
            // Revisar de nuevo si fue desactivado mientras se esperaba el bloqueo.
            const horarioActual = await Horario.findByPk(idHorario, { transaction });
            if (!horarioActual || !horarioActual.disponible) {
                const err = new Error("Este horario ya no está disponible.");
                err.status = 409;
                throw err;
            }
            const reservas = await Turno.findAll({
                where: { fecha_turno: { [Op.gte]: comienzoDia, [Op.lt]: finDia } },
                include: [{
                    model: Horario,
                    required: true,
                    where: { id_profesional: horario.id_profesional }
                }],
                transaction
            });
            const conflicto = reservas.some(reserva => {
                const inicioExistente = new Date(reserva.fecha_turno).getTime();
                const minutosExistente = aMinutos(reserva.Horario.hora_fin) -
                    aMinutos(reserva.Horario.hora_inicio);
                const finExistente = inicioExistente + minutosExistente * 60000;
                return fecha.getTime() < finExistente && finNuevo.getTime() > inicioExistente;
            });
            if (conflicto) {
                const err = new Error("Ese turno ya está reservado. Elegí otro horario.");
                err.status = 409;
                throw err;
            }
            return Turno.create({
                id_paciente: idPaciente,
                id_horario: idHorario,
                fecha_turno: fecha
            }, { transaction });
        });
        res.status(201).json(turno);
    } catch (error) {
        console.error("Error al reservar turno:", error);
        res.status(error.status || 500).json({
            mensaje: error.status ? error.message : "No se pudo registrar el turno."
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

// ==================== CONTROL DE ASISTENCIA ====================

app.patch("/turnos/:id/estado", async (req, res) => {

    try {

        const idTurno = Number(req.params.id);
        const idProfesional = Number(req.body.id_profesional);
        const nuevoEstado = req.body.estado;

        // Verificar identificadores
        if (
            !Number.isInteger(idTurno) ||
            idTurno <= 0 ||
            !Number.isInteger(idProfesional) ||
            idProfesional <= 0
        ) {
            return res.status(400).json({
                mensaje: "Identificadores no válidos"
            });
        }

        // Estados permitidos
        const estadosPermitidos = [
            "reservado",
            "en_espera",
            "en_consulta",
            "atendido",
            "no_asistio"
        ];

        if (!estadosPermitidos.includes(nuevoEstado)) {
            return res.status(400).json({
                mensaje: "Estado no válido"
            });
        }

        // Buscar el turno con su horario
        const turno = await Turno.findByPk(idTurno, {
            include: [Horario]
        });

        if (!turno) {
            return res.status(404).json({
                mensaje: "Turno no encontrado"
            });
        }

        // Comprobar que el horario corresponde al profesional
        if (
            !turno.Horario ||
            Number(turno.Horario.id_profesional) !== idProfesional
        ) {
            return res.status(403).json({
                mensaje: "El turno no pertenece a ese profesional"
            });
        }

        // Validar los cambios de estado
        const transiciones = {
            reservado: ["en_espera", "no_asistio"],
            en_espera: ["en_consulta", "no_asistio"],
            en_consulta: ["atendido"],
            atendido: [],
            no_asistio: []
        };

        if (!transiciones[turno.estado].includes(nuevoEstado)) {
            return res.status(400).json({
                mensaje: "No se puede realizar ese cambio de estado"
            });
        }

        // Guardar hora real de inicio
        if (nuevoEstado === "en_consulta") {
            turno.inicio_atencion = new Date();
        }

        // Guardar hora real de finalización
        if (nuevoEstado === "atendido") {
            turno.fin_atencion = new Date();
        }

        // Actualizar estado
        turno.estado = nuevoEstado;

        await turno.save();

        res.json({
            mensaje: "Estado actualizado correctamente",
            turno: turno
        });

    } catch (error) {

        console.error("Error al actualizar estado:", error);

        res.status(500).json({
            mensaje: "No se pudo actualizar el estado"
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

// ==================== LOGIN CON JWT ====================

app.post("/login", async (req, res) => {
    try {

        const { nombre, contraseña } = req.body;

        // Buscar usuario en PostgreSQL
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

        // Buscar si el usuario es paciente
        const paciente = await Paciente.findOne({
            where: {
                id_persona: usuario.id_persona
            }
        });

        // Generar token de autenticación
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                id_persona: usuario.id_persona
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "2h"
            }
        );

        // Enviar respuesta al frontend
        res.json({
            mensaje: "Login correcto",

            usuario: usuario.nombre,

            rol: usuario.Rol.tipo_rol,

            persona: usuario.Persona,

            id_paciente: paciente
                ? paciente.id_paciente
                : null,

            token: token
        });

    } catch (error) {

        console.error("Error al iniciar sesión:", error);

        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });

    }
});

// | INICIAR SERVIDOR ====================

// ==========================================
// VERIFICAR AUTENTICACIÓN DEL PACIENTE
// ==========================================

async function verificarPaciente(req, res, next) {

    try {

        // Obtener token enviado desde el frontend
        const autorizacion = req.headers.authorization || "";

        const [tipo, token] = autorizacion.split(" ");

        if (tipo !== "Bearer" || !token) {

            return res.status(401).json({
                mensaje: "Debés iniciar sesión para consultar tus atenciones."
            });

        }

        // Comprobar que el token sea válido
        let datosToken;

        try {

            datosToken = jwt.verify(
                token,
                process.env.JWT_SECRET,
                {
                    algorithms: ["HS256"]
                }
            );

        } catch (error) {

            return res.status(401).json({
                mensaje: "Tu sesión venció o no es válida. Iniciá sesión nuevamente."
            });

        }

        // Buscar el usuario en PostgreSQL
        const usuario = await Usuario.findByPk(
            datosToken.id_usuario,
            {
                include: [Rol]
            }
        );

        if (!usuario) {

            return res.status(404).json({
                mensaje: "Usuario no encontrado."
            });

        }

        // Verificar que el token corresponda a ese usuario
        if (
            Number(usuario.id_persona) !==
            Number(datosToken.id_persona)
        ) {

            return res.status(403).json({
                mensaje: "No tenés autorización para acceder."
            });

        }

        // Comprobar el rol
        const nombreRol = String(
            usuario.Rol?.tipo_rol || ""
        ).trim().toLowerCase();

        if (
            nombreRol !== "paciente" &&
            nombreRol !== "alumno"
        ) {

            return res.status(403).json({
                mensaje: "Esta sección es exclusiva para pacientes."
            });

        }

        // Buscar al paciente vinculado con el usuario
        const paciente = await Paciente.findOne({
            where: {
                id_persona: usuario.id_persona
            }
        });

        if (!paciente) {

            return res.status(404).json({
                mensaje: "No se encontró el paciente asociado a esta cuenta."
            });

        }

        // Guardar paciente autenticado en la petición
        req.pacienteAutenticado = paciente;

        next();

    } catch (error) {

        console.error("Error de autenticación:", error);

        res.status(500).json({
            mensaje: "No se pudo comprobar la autenticación."
        });

    }

}


// ==========================================
// MIS ATENCIONES DEL PACIENTE
// ==========================================

app.get("/mis-atenciones", verificarPaciente, async (req, res) => {

    try {

        // Obtenemos el ID desde la autenticación,
        // NO desde localStorage ni de la URL.

        const idPaciente = req.pacienteAutenticado.id_paciente;

        // Buscar todas las atenciones del paciente
        const atenciones = await Atencion.findAll({

            where: {
                id_paciente: idPaciente
            },

            attributes: [
                "id_atencion",
                "fecha_atencion",
                "motivo_consulta",
                "diagnostico",
                "observacion",
                "indicaciones"
            ],

            include: [
                {
                    model: Profesional,

                    attributes: [
                        "id_profesional"
                    ],

                    include: [
                        {
                            model: Persona,

                            attributes: [
                                "nombre",
                                "apellido"
                            ]
                        },

                        {
                            model: Especialidad,

                            attributes: [
                                "nombre"
                            ]
                        }
                    ]
                }
            ],

            order: [
                ["fecha_atencion", "DESC"]
            ]

        });

        // Enviar historial al paciente
        res.json(atenciones);

    } catch (error) {

        console.error("Error al consultar mis atenciones:", error);

        res.status(500).json({
            mensaje: "No se pudieron consultar las atenciones médicas."
        });

    }

});

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
const Persona = require("./modelos/Persona");
const Usuario = require("./modelos/Usuario");
const Rol = require("./modelos/Rol");

const Profesional = require("./modelos/Profesional");
const Paciente = require("./modelos/Paciente");
const Especialidad = require("./modelos/Especialidad");
const Horario = require("./modelos/Horario");
const Atencion = require("./modelos/Atencion");
const Sala = require("./modelos/Sala");

// hasOne()     -> relación 1:1
// hasMany()    -> relación 1:N
// belongsTo()  -> indica a qué tabla pertenece la clave foránea

// Persona 1:1 Usuario
Persona.hasOne(Usuario, { // hasOne: indica que una persona tiene un usuario
    foreignKey: "id_persona"
});

Usuario.belongsTo(Persona, { // belongsTo: indica que un usuario pertenece a una persona
    foreignKey: "id_persona"
});

// Rol 1:N Usuario 
Rol.hasMany(Usuario, { // hasMany: indica que un rol puede tener muchos usuarios
    foreignKey: "id_rol"
});

Usuario.belongsTo(Rol, { // belongsTo: indica que un usuario pertenece a un rol
    foreignKey: "id_rol"
});


// Persona 1:1 Profesional
Persona.hasOne(Profesional, { // hasOne: indica que una persona tiene un profesional
    foreignKey: "id_persona"
});

Profesional.belongsTo(Persona, { // belongsTo: indica que un profesional pertenece a una persona
    foreignKey: "id_persona"
});


// Persona 1:1 Paciente
Persona.hasOne(Paciente, { // hasOne: indica que una persona tiene un paciente
    foreignKey: "id_persona"
});

Paciente.belongsTo(Persona, { // belongsTo: indica que un paciente pertenece a una persona
    foreignKey: "id_persona"
});


// Paciente 1:N Turno
Paciente.hasMany(Turno, { // hasMany: indica que un paciente puede tener muchos turnos
    foreignKey: "id_paciente"
});

Turno.belongsTo(Paciente, { // belongsTo: indica que un turno pertenece a un paciente
    foreignKey: "id_paciente"
});


// Especialidad 1:N Profesional
Especialidad.hasMany(Profesional, { // hasMany: indica que una especialidad puede tener muchos profesionales
    foreignKey: "id_especialidad"
});

Profesional.belongsTo(Especialidad, { // belongsTo: indica que un profesional pertenece a una especialidad
    foreignKey: "id_especialidad"
});


// Profesional 1:N Horario
Profesional.hasMany(Horario, { // hasMany: indica que un profesional puede tener muchos horarios
    foreignKey: "id_profesional"
});

Horario.belongsTo(Profesional, { // belongsTo: indica que un horario pertenece a un profesional
    foreignKey: "id_profesional"
});


// Profesional 1:N Turno
Profesional.hasMany(Turno, { // hasMany: indica que un profesional puede tener muchos turnos
    foreignKey: "id_profesional"
});

Turno.belongsTo(Profesional, { // belongsTo: indica que un turno pertenece a un profesional
    foreignKey: "id_profesional"
});


// Horario 1:N Turno
Horario.hasMany(Turno, { // hasMany: indica que un horario puede tener muchos turnos
    foreignKey: "id_horario"
});

Turno.belongsTo(Horario, { // belongsTo: indica que un turno pertenece a un horario
    foreignKey: "id_horario"
});


// Sala 1:N Turno
Sala.hasMany(Turno, { // hasMany: indica que una sala puede tener muchos turnos
    foreignKey: "id_sala"
});

Turno.belongsTo(Sala, { // belongsTo: indica que un turno pertenece a una sala
    foreignKey: "id_sala"
});

// Turno 1:1 Atencion 
Turno.hasOne(Atencion, { // hasOne: indica que un turno tiene una atención
    foreignKey: "id_turno"
});

Atencion.belongsTo(Turno, { // belongsTo: indica que una atención pertenece a un turno
    foreignKey: "id_turno"
});
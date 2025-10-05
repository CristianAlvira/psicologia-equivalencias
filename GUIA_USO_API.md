# Sistema de Equivalencias de Mallas Curriculares - Guía de Uso

## Descripción General

Este sistema permite evaluar homologaciones entre una malla curricular antigua y una nueva, basándose en reglas de equivalencia predefinidas.

## Flujo Completo del Sistema

### 1. Configuración Inicial

#### 1.1 Crear Programa
```http
POST /api/programas
Content-Type: application/json

{
  "nombre": "Psicología"
}
```

#### 1.2 Crear Mallas Curriculares
```http
POST /api/malla-curricular
Content-Type: application/json

{
  "version": "Malla 2018",
  "programaId": 1
}
```

```http
POST /api/malla-curricular
Content-Type: application/json

{
  "version": "Malla 2025", 
  "programaId": 1
}
```

#### 1.3 Crear Cursos para cada Malla

**Cursos Malla Antigua (2018):**
```http
POST /api/cursos
Content-Type: application/json

{
  "nombre": "Introducción a la Psicología",
  "creditos": 3,
  "semestre": "PRIMERO",
  "mallaCurricularId": 1
}
```

**Cursos Malla Nueva (2025):**
```http
POST /api/cursos
Content-Type: application/json

{
  "nombre": "Fundamentos de Psicología",
  "creditos": 4,
  "semestre": "PRIMERO", 
  "mallaCurricularId": 2
}
```

#### 1.4 Definir Equivalencias

**Crear grupo de equivalencias:**
```http
POST /api/equivalencias/grupos
Content-Type: application/json

{
  "descripcion": "Electivas básicas",
  "mallaAntiguaId": 1,
  "mallaNuevaId": 2,
  "items": [
    {
      "cursoId": 4,
      "lado": "ANTIGUA"
    },
    {
      "cursoId": 8,
      "lado": "ANTIGUA"
    },
    {
      "cursoId": 104,
      "lado": "NUEVA"
    }
  ]
}
```

### 2. Flujo del Estudiante

#### 2.1 Registro de Estudiante
```http
POST /api/usuarios/estudiantes
Content-Type: application/json

{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López",
  "codigo_estudiantil": "2020123456"
}
```

#### 2.2 Obtener Programas Disponibles
```http
GET /api/programas
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Psicología",
    "created_at": "2025-10-02T21:00:00.000Z",
    "updated_at": "2025-10-02T21:00:00.000Z"
  }
]
```

#### 2.3 Obtener Mallas del Programa
```http
GET /api/malla-curricular?programaId=1
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "version": "Malla 2018",
    "programaId": 1,
    "programa": { "nombre": "Psicología" }
  },
  {
    "id": 2,
    "version": "Malla 2025", 
    "programaId": 1,
    "programa": { "nombre": "Psicología" }
  }
]
```

#### 2.4 Obtener Cursos de la Malla Antigua
```http
GET /api/cursos?mallaId=1
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Introducción a la Psicología",
    "creditos": 3,
    "semestre": "PRIMERO",
    "mallaCurricularId": 1
  },
  {
    "id": 4,
    "nombre": "Electiva I",
    "creditos": 2,
    "semestre": "PRIMERO", 
    "mallaCurricularId": 1
  },
  {
    "id": 8,
    "nombre": "Electiva II",
    "creditos": 2,
    "semestre": "SEGUNDO",
    "mallaCurricularId": 1
  }
]
```

#### 2.5 Evaluar Homologaciones

**El estudiante selecciona los cursos que ya cursó (por ejemplo: solo Electiva I):**

```http
POST /api/equivalencias/evaluar
Content-Type: application/json

{
  "estudianteId": 1,
  "mallaAntiguaId": 1,
  "mallaNuevaId": 2,
  "cursosAntiguosMarcados": [1, 4]
}
```

**Respuesta esperada:**
```json
{
  "porCursoNuevo": {
    "101": {
      "estado": "HOMOLOGADO",
      "observacion": "Homologado por: Introducción a la Psicología.",
      "cursoNuevo": {
        "id": 101,
        "nombre": "Fundamentos de Psicología",
        "creditos": 4,
        "semestre": "PRIMERO"
      },
      "grupoId": 1,
      "cursosAntiguosPresentes": [1],
      "cursosAntiguosFaltantes": []
    },
    "104": {
      "estado": "INCOMPLETO", 
      "observacion": "Tienes: Electiva I. Te falta: Electiva II.",
      "cursoNuevo": {
        "id": 104,
        "nombre": "Electivas Integradas",
        "creditos": 3,
        "semestre": "PRIMERO"
      },
      "grupoId": 4,
      "cursosAntiguosPresentes": [4],
      "cursosAntiguosFaltantes": [8]
    },
    "102": {
      "estado": "NO_APLICA",
      "observacion": "No existe regla de homologación para este curso.",
      "cursoNuevo": {
        "id": 102,
        "nombre": "Metodología de Investigación",
        "creditos": 3,
        "semestre": "SEGUNDO"
      },
      "cursosAntiguosPresentes": [],
      "cursosAntiguosFaltantes": []
    }
  },
  "resumen": {
    "homologados": 1,
    "incompletos": 1, 
    "noAplica": 8,
    "creditosCompletadosMallaAntigua": 12,
    "creditosHomologadosMallaNueva": 7,
    "totalCreditosMallaNueva": 155
  }
}
```

### 3. Consultas Útiles

#### 3.1 Ver todas las equivalencias entre dos mallas
```http
GET /api/equivalencias?mallaAntiguaId=1&mallaNuevaId=2
```

#### 3.2 Ver detalles de un grupo de equivalencias
```http
GET /api/equivalencias/grupos/4
```

#### 3.3 Consultar resultados de un estudiante con resumen detallado
```http
GET /api/equivalencias/resultados?estudianteId=1&mallaAntiguaId=1&mallaNuevaId=2
```

**Respuesta:**
```json
{
  "resultados": [
    {
      "id": 1,
      "estado": "HOMOLOGADO",
      "observacion": "Homologado por: Introducción a la Psicología",
      "cursoNuevo": {
        "id": 101,
        "nombre": "Fundamentos de Psicología",
        "creditos": 4
      },
      "created_at": "2025-01-16T10:30:00.000Z"
    }
  ],
  "resumen": {
    "homologados": 5,
    "incompletos": 2,
    "noAplica": 15,
    "creditosCompletadosMallaAntigua": 45,
    "creditosHomologadosMallaNueva": 35,
    "totalCreditosMallaNueva": 155
  },
  "estudianteId": 1,
  "mallaAntiguaId": 1,
  "mallaNuevaId": 2
}
```

**Respuesta:**
```json
{
  "id": 4,
  "descripcion": "Electivas básicas",
  "mallaAntiguaId": 1,
  "mallaNuevaId": 2,
  "items": [
    {
      "id": 10,
      "cursoId": 4,
      "lado": "ANTIGUA",
      "curso": {
        "nombre": "Electiva I",
        "creditos": 2,
        "semestre": "PRIMERO"
      }
    },
    {
      "id": 11,
      "cursoId": 8,
      "lado": "ANTIGUA", 
      "curso": {
        "nombre": "Electiva II",
        "creditos": 2,
        "semestre": "SEGUNDO"
      }
    },
    {
      "id": 12,
      "cursoId": 104,
      "lado": "NUEVA",
      "curso": {
        "nombre": "Electivas Integradas",
        "creditos": 3,
        "semestre": "PRIMERO"
      }
    }
  ]
}
```

## Casos de Uso Detallados

### Caso 1: Equivalencia 1:1 (Simple)
- **Antiguo:** "Introducción a la Psicología" 
- **Nuevo:** "Fundamentos de Psicología"
- **Resultado:** Si el estudiante cursó "Introducción a la Psicología" → "Fundamentos de Psicología" queda HOMOLOGADO

### Caso 2: Equivalencia 2:1 (Requiere múltiples cursos)
- **Antiguos:** "Electiva I" + "Electiva II"
- **Nuevo:** "Electivas Integradas"
- **Resultados posibles:**
  - Ambas cursadas → HOMOLOGADO
  - Solo una cursada → INCOMPLETO
  - Ninguna cursada → NO_APLICA (si no se selecciona)

### Caso 3: Sin equivalencia definida
- **Curso nuevo:** "Matemáticas Aplicadas" (sin equivalencia definida)
- **Resultado:** NO_APLICA

## Estados de Homologación

| Estado | Descripción | Acción requerida |
|--------|-------------|------------------|
| **HOMOLOGADO** ✅ | El curso ya está completamente homologado | Ninguna |
| **INCOMPLETO** 🟡 | Faltan cursos para completar la homologación | Debe cursar los faltantes |
| **NO_APLICA** ⚪ | No hay regla de equivalencia | Debe cursar el curso nuevo |

## Información de Créditos en el Resumen

El resumen incluye información detallada sobre créditos para ayudar al estudiante a entender su progreso:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `homologados` | Número de cursos homologados | 5 |
| `incompletos` | Número de cursos con homologación incompleta | 2 |
| `noAplica` | Número de cursos sin regla de equivalencia | 15 |
| `creditosCompletadosMallaAntigua` | Total de créditos que completó en la malla antigua | 45 |
| `creditosHomologadosMallaNueva` | Créditos que obtiene en la malla nueva por homologación | 35 |
| `totalCreditosMallaNueva` | Total de créditos requeridos en la malla nueva | 155 |

### Interpretación del Ejemplo:
- **Malla Antigua**: El estudiante completó 45 créditos
- **Malla Nueva**: Le homologan 35 créditos de los 155 totales
- **Pendiente**: Le faltan 120 créditos por cursar en la malla nueva

## Frontend UX Recomendado

### Pantalla 1: Selección
1. Dropdown de programas
2. Auto-carga mallas (antigua/nueva)

### Pantalla 2: Selección de Cursos
```
Malla Curricular 2018 - Psicología

📚 PRIMER SEMESTRE
☑️ Introducción a la Psicología (3 créditos)
☑️ Electiva I (2 créditos)  
☐ Matemáticas I (3 créditos)
☐ Biología General (4 créditos)

📚 SEGUNDO SEMESTRE  
☐ Electiva II (2 créditos)
☐ Estadística I (3 créditos)
...

[Evaluar Homologaciones]
```

### Pantalla 3: Resultados
```
Malla Curricular 2025 - Resultados de Homologación

📚 PRIMER SEMESTRE
✅ Fundamentos de Psicología (4 créditos)
   💡 Homologado por: Introducción a la Psicología

🟡 Electivas Integradas (3 créditos) 
   💡 Tienes: Electiva I. Te falta: Electiva II

📚 SEGUNDO SEMESTRE
⚪ Metodología de Investigación (3 créditos)
   💡 No existe regla de homologación para este curso

📊 RESUMEN
✅ Homologados: 1 curso
🟡 Incompletos: 1 curso  
⚪ Sin homologar: 8 cursos
```

## Datos de Prueba

Usa el archivo `seeds/ejemplo-equivalencias.sql` para cargar datos de ejemplo y probar todas las funcionalidades del sistema.
-- Ejemplo de datos para el sistema de equivalencias de mallas curriculares

-- 1. Programa de Psicología
INSERT INTO programas (id, nombre, created_at, updated_at) VALUES 
(1, 'Psicología', NOW(), NOW());

-- 2. Mallas curriculares (antigua y nueva)
INSERT INTO mallas_curriculares (id, version, programa_id, created_at, updated_at) VALUES 
(1, 'Malla 2018', 1, NOW(), NOW()),
(2, 'Malla 2025', 1, NOW(), NOW());

-- 3. Cursos malla antigua (2018)
INSERT INTO cursos (id, nombre, creditos, semestre, malla_curricular_id, created_at, updated_at) VALUES 
-- Semestre 1
(1, 'Introducción a la Psicología', 3, 'PRIMERO', 1, NOW(), NOW()),
(2, 'Matemáticas I', 3, 'PRIMERO', 1, NOW(), NOW()),
(3, 'Biología General', 4, 'PRIMERO', 1, NOW(), NOW()),
(4, 'Electiva I', 2, 'PRIMERO', 1, NOW(), NOW()),

-- Semestre 2  
(5, 'Psicología del Desarrollo', 3, 'SEGUNDO', 1, NOW(), NOW()),
(6, 'Estadística I', 3, 'SEGUNDO', 1, NOW(), NOW()),
(7, 'Neurobiología', 4, 'SEGUNDO', 1, NOW(), NOW()),
(8, 'Electiva II', 2, 'SEGUNDO', 1, NOW(), NOW()),

-- Semestre 3
(9, 'Psicología Cognitiva', 4, 'TERCERO', 1, NOW(), NOW()),
(10, 'Metodología de la Investigación', 3, 'TERCERO', 1, NOW(), NOW()),

-- Semestre 4
(11, 'Psicología Social', 4, 'CUARTO', 1, NOW(), NOW()),
(12, 'Técnicas de Evaluación', 3, 'CUARTO', 1, NOW(), NOW());

-- 4. Cursos malla nueva (2025)
INSERT INTO cursos (id, nombre, creditos, semestre, malla_curricular_id, created_at, updated_at) VALUES 
-- Semestre 1
(101, 'Fundamentos de Psicología', 4, 'PRIMERO', 2, NOW(), NOW()),
(102, 'Matemáticas Aplicadas', 3, 'PRIMERO', 2, NOW(), NOW()),
(103, 'Bases Biológicas del Comportamiento', 4, 'PRIMERO', 2, NOW(), NOW()),
(104, 'Electivas Integradas', 3, 'PRIMERO', 2, NOW(), NOW()),

-- Semestre 2
(105, 'Psicología Evolutiva', 4, 'SEGUNDO', 2, NOW(), NOW()),
(106, 'Estadística y Análisis de Datos', 4, 'SEGUNDO', 2, NOW(), NOW()),
(107, 'Neurociencias Aplicadas', 4, 'SEGUNDO', 2, NOW(), NOW()),

-- Semestre 3  
(108, 'Procesos Cognitivos', 4, 'TERCERO', 2, NOW(), NOW()),
(109, 'Investigación en Psicología', 4, 'TERCERO', 2, NOW(), NOW()),

-- Semestre 4
(110, 'Psicología de Grupos', 4, 'CUARTO', 2, NOW(), NOW()),
(111, 'Evaluación Psicológica', 4, 'CUARTO', 2, NOW(), NOW());

-- 5. Grupos de equivalencias entre mallas
INSERT INTO equivalencia_grupos (id, descripcion, malla_antigua_id, malla_nueva_id, created_at, updated_at) VALUES 
(1, 'Fundamentos básicos de psicología', 1, 2, NOW(), NOW()),
(2, 'Matemáticas y estadística', 1, 2, NOW(), NOW()),
(3, 'Biología y neurociencias', 1, 2, NOW(), NOW()),
(4, 'Electivas básicas', 1, 2, NOW(), NOW()),
(5, 'Desarrollo y evolución', 1, 2, NOW(), NOW()),
(6, 'Cognición y procesos mentales', 1, 2, NOW(), NOW()),
(7, 'Metodología de investigación', 1, 2, NOW(), NOW()),
(8, 'Psicología social', 1, 2, NOW(), NOW()),
(9, 'Evaluación psicológica', 1, 2, NOW(), NOW());

-- 6. Items de equivalencias (definiendo las equivalencias exactas)
INSERT INTO equivalencia_items (grupo_id, curso_id, lado, created_at, updated_at) VALUES 
-- Grupo 1: Fundamentos básicos (1:1)
(1, 1, 'ANTIGUA', NOW(), NOW()),  -- Introducción a la Psicología
(1, 101, 'NUEVA', NOW(), NOW()),  -- Fundamentos de Psicología

-- Grupo 2: Matemáticas (2:1 - requiere ambas de la antigua)
(2, 2, 'ANTIGUA', NOW(), NOW()),  -- Matemáticas I
(2, 6, 'ANTIGUA', NOW(), NOW()),  -- Estadística I  
(2, 102, 'NUEVA', NOW(), NOW()),  -- Matemáticas Aplicadas
(2, 106, 'NUEVA', NOW(), NOW()),  -- Estadística y Análisis de Datos

-- Grupo 3: Biología (2:2)
(3, 3, 'ANTIGUA', NOW(), NOW()),  -- Biología General
(3, 7, 'ANTIGUA', NOW(), NOW()),  -- Neurobiología
(3, 103, 'NUEVA', NOW(), NOW()),  -- Bases Biológicas del Comportamiento  
(3, 107, 'NUEVA', NOW(), NOW()),  -- Neurociencias Aplicadas

-- Grupo 4: Electivas (2:1 - requiere ambas electivas de la antigua)
(4, 4, 'ANTIGUA', NOW(), NOW()),  -- Electiva I
(4, 8, 'ANTIGUA', NOW(), NOW()),  -- Electiva II
(4, 104, 'NUEVA', NOW(), NOW()),  -- Electivas Integradas

-- Grupo 5: Desarrollo (1:1)
(5, 5, 'ANTIGUA', NOW(), NOW()),  -- Psicología del Desarrollo
(5, 105, 'NUEVA', NOW(), NOW()),  -- Psicología Evolutiva

-- Grupo 6: Cognición (1:1)
(6, 9, 'ANTIGUA', NOW(), NOW()),  -- Psicología Cognitiva
(6, 108, 'NUEVA', NOW(), NOW()),  -- Procesos Cognitivos

-- Grupo 7: Metodología (1:1)
(7, 10, 'ANTIGUA', NOW(), NOW()), -- Metodología de la Investigación
(7, 109, 'NUEVA', NOW(), NOW()),  -- Investigación en Psicología

-- Grupo 8: Social (1:1)
(8, 11, 'ANTIGUA', NOW(), NOW()), -- Psicología Social
(8, 110, 'NUEVA', NOW(), NOW()),  -- Psicología de Grupos

-- Grupo 9: Evaluación (1:1)
(9, 12, 'ANTIGUA', NOW(), NOW()), -- Técnicas de Evaluación
(9, 111, 'NUEVA', NOW(), NOW());  -- Evaluación Psicológica

-- 7. Roles para el sistema
INSERT INTO roles (id, nombre_rol, descripcion, created_at, updated_at) VALUES 
(1, 'administrador', 'Administrador del sistema', NOW(), NOW()),
(2, 'estudiante', 'Estudiante', NOW(), NOW()),
(3, 'coordinador', 'Coordinador académico', NOW(), NOW());

-- 8. Usuario estudiante de ejemplo
INSERT INTO usuarios (id, nombres, apellidos, codigo_estudiantil, estado, created_at, updated_at) VALUES 
(1, 'Juan Carlos', 'Pérez López', '2020123456', true, NOW(), NOW());

-- 9. Asignar rol de estudiante
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (1, 2);
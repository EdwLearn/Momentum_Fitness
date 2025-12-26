-- Script para limpiar referidos inválidos (Pase Diario y Pase Flex no deben tener descuento por referido)

-- Mostrar referidos que serán eliminados
SELECT 'Referidos a eliminar (Pase Diario y Pase Flex):' as info;
SELECT
    r.id,
    ref_dor.nombre || ' ' || ref_dor.apellido as referidor,
    ref_do.nombre || ' ' || ref_do.apellido as referido,
    m.tipo_plan as plan_comprado
FROM referidos r
JOIN usuarios ref_dor ON r.referidor_id = ref_dor.id
JOIN usuarios ref_do ON r.referido_id = ref_do.id
LEFT JOIN membresias m ON r.membresia_id = m.id
WHERE m.tipo_plan IN ('pase_diario', 'pase_flex');

-- Eliminar referidos inválidos
DELETE FROM referidos
WHERE membresia_id IN (
    SELECT id FROM membresias
    WHERE tipo_plan IN ('pase_diario', 'pase_flex')
);

-- Mostrar resumen
SELECT 'LIMPIEZA COMPLETADA' as resultado;
SELECT COUNT(*) as total_referidos_validos FROM referidos;

-- Mostrar referidos válidos restantes
SELECT
    r.id,
    ref_dor.nombre || ' ' || ref_dor.apellido as referidor,
    ref_do.nombre || ' ' || ref_do.apellido as referido,
    m.tipo_plan as plan_comprado,
    r.beneficio
FROM referidos r
JOIN usuarios ref_dor ON r.referidor_id = ref_dor.id
JOIN usuarios ref_do ON r.referido_id = ref_do.id
LEFT JOIN membresias m ON r.membresia_id = m.id;

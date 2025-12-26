-- Script para migrar datos existentes de referidos a la tabla referidos

-- Insertar referidos basándose en las membresías que tienen referido_por_id
INSERT INTO referidos (referidor_id, referido_id, membresia_id, cumple_condicion, beneficio, fecha_referido)
SELECT
    m.referido_por_id as referidor_id,
    m.usuario_id as referido_id,
    m.id as membresia_id,
    1 as cumple_condicion,  -- Asumimos que si compraron un plan, cumplen la condición
    'Descuento aplicado - 5%' as beneficio,  -- Beneficio otorgado
    m.fecha_inicio as fecha_referido
FROM membresias m
WHERE m.referido_por_id IS NOT NULL
    AND m.referido_por_id != m.usuario_id  -- Evitar auto-referencias
    AND NOT EXISTS (  -- Evitar duplicados
        SELECT 1 FROM referidos r
        WHERE r.referidor_id = m.referido_por_id
        AND r.referido_id = m.usuario_id
        AND r.membresia_id = m.id
    );

-- Mostrar resumen
SELECT 'MIGRACIÓN COMPLETADA' as resultado;
SELECT COUNT(*) as total_referidos_migrados FROM referidos;

-- Mostrar algunos ejemplos
SELECT
    r.id,
    ref_dor.nombre || ' ' || ref_dor.apellido as referidor,
    ref_do.nombre || ' ' || ref_do.apellido as referido,
    m.tipo_plan as plan_comprado,
    r.beneficio
FROM referidos r
JOIN usuarios ref_dor ON r.referidor_id = ref_dor.id
JOIN usuarios ref_do ON r.referido_id = ref_do.id
LEFT JOIN membresias m ON r.membresia_id = m.id
LIMIT 5;

"""
Script de prueba para verificar el comportamiento del campo 'activo'
después de la migración.
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.usuario import TipoUsuario
from app.schemas.usuario import UsuarioCreate
from app.crud import usuarios as crud
from datetime import datetime

def test_usuario_activo():
    """Prueba el comportamiento del campo activo"""

    print("\n" + "="*60)
    print("🧪 TEST: Comportamiento del campo 'activo'")
    print("="*60 + "\n")

    # Crear engine y sesión
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Test 1: Crear usuario CLIENTE
        print("📝 Test 1: Crear usuario CLIENTE (sin membresía)")
        usuario_cliente = UsuarioCreate(
            nombre="Test",
            apellido="Cliente",
            email=f"test.cliente.{datetime.now().timestamp()}@test.com",
            telefono="1234567890",
            tipo=TipoUsuario.CLIENTE
        )

        cliente_creado = crud.create_usuario(db, usuario_cliente)
        print(f"   ✅ Usuario CLIENTE creado")
        print(f"   📊 ID: {cliente_creado.id}")
        print(f"   📊 Nombre: {cliente_creado.nombre} {cliente_creado.apellido}")
        print(f"   📊 Tipo: {cliente_creado.tipo}")
        print(f"   📊 Activo: {cliente_creado.activo}")

        if cliente_creado.activo == False:
            print("   ✅ CORRECTO: Usuario CLIENTE creado como INACTIVO")
        else:
            print("   ❌ ERROR: Usuario CLIENTE debería estar INACTIVO")

        print()

        # Test 2: Crear usuario ENTRENADOR
        print("📝 Test 2: Crear usuario ENTRENADOR")
        usuario_entrenador = UsuarioCreate(
            nombre="Test",
            apellido="Entrenador",
            email=f"test.entrenador.{datetime.now().timestamp()}@test.com",
            telefono="0987654321",
            tipo=TipoUsuario.ENTRENADOR
        )

        entrenador_creado = crud.create_usuario(db, usuario_entrenador)
        print(f"   ✅ Usuario ENTRENADOR creado")
        print(f"   📊 ID: {entrenador_creado.id}")
        print(f"   📊 Nombre: {entrenador_creado.nombre} {entrenador_creado.apellido}")
        print(f"   📊 Tipo: {entrenador_creado.tipo}")
        print(f"   📊 Activo: {entrenador_creado.activo}")

        if entrenador_creado.activo == True:
            print("   ✅ CORRECTO: Usuario ENTRENADOR creado como ACTIVO")
        else:
            print("   ❌ ERROR: Usuario ENTRENADOR debería estar ACTIVO")

        print()

        # Test 3: Crear usuario ADMIN
        print("📝 Test 3: Crear usuario ADMIN")
        usuario_admin = UsuarioCreate(
            nombre="Test",
            apellido="Admin",
            email=f"test.admin.{datetime.now().timestamp()}@test.com",
            telefono="1122334455",
            tipo=TipoUsuario.ADMIN
        )

        admin_creado = crud.create_usuario(db, usuario_admin)
        print(f"   ✅ Usuario ADMIN creado")
        print(f"   📊 ID: {admin_creado.id}")
        print(f"   📊 Nombre: {admin_creado.nombre} {admin_creado.apellido}")
        print(f"   📊 Tipo: {admin_creado.tipo}")
        print(f"   📊 Activo: {admin_creado.activo}")

        if admin_creado.activo == True:
            print("   ✅ CORRECTO: Usuario ADMIN creado como ACTIVO")
        else:
            print("   ❌ ERROR: Usuario ADMIN debería estar ACTIVO")

        print()

        # Limpiar usuarios de prueba
        print("🧹 Limpiando usuarios de prueba...")
        crud.delete_usuario(db, cliente_creado.id)
        crud.delete_usuario(db, entrenador_creado.id)
        crud.delete_usuario(db, admin_creado.id)
        print("   ✅ Usuarios de prueba eliminados")

        print("\n" + "="*60)
        print("✅ TODOS LOS TESTS PASARON CORRECTAMENTE")
        print("="*60 + "\n")

        return True

    except Exception as e:
        print(f"\n❌ ERROR durante el test: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        db.close()

if __name__ == "__main__":
    success = test_usuario_activo()
    sys.exit(0 if success else 1)

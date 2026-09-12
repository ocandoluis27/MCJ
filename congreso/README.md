# Sistema de Entradas y Gestión del Congreso · María Camino a Jesús

Módulo oficial para el **Congreso Gracia y Misericordia (16 al 18 de Octubre de 2026)** en el Centro de Arte de Maracaibo Lía Bermúdez (CAMLB).

## Características Principales

1. **Formulario Obligatorio de Asistentes:**
   - Nombre completo, Cédula de Identidad, Teléfono WhatsApp, Correo electrónico.
   - Datos logísticos: Ciudad, Parroquia eclesial, Grupo de apostolado, Hospedaje y Transporte.
2. **Pasarela de Pagos C2P & Tasas BCV:**
   - Tasas en vivo Dólar/Euro BCV vía `dolarapi.com`.
   - Prototipo C2P con 22 bancos nacionales venezolanos y flujo de OTP SMS.
   - Métodos alternativos: Pago Móvil con comprobante y Efectivo/Taquilla.
3. **Lote de 250 Entradas Físicas:**
   - 250 códigos QR pre-generados (`entradas_fisicas_qr/`) con URLs seguras para auto-activación del asistente.
4. **Doble Modalidad de Escaneo QR:**
   - Control de Acceso General (`/escanear`).
   - Control de Comedor / Almuerzos (`/almuerzos`) con saldo decreciente de 3 a 0 e historial de auditoría.
5. **Panel Administrativo (`/admin`):**
   - Métricas en tiempo real de asistencia, finanzas y comidas.
   - Directorio de asistentes con búsqueda y exportación a Excel (`.xlsx`).
   - Verificación de comprobantes de pago.
   - Activación de entradas físicas.
   - Editor de tarifas, cupos y configuración institucional.
6. **Integración con Supabase:**
   - Base de datos relacional PostgreSQL en vivo.
   - Almacenamiento público para comprobantes (`comprobantes`).
   - Capa híbrida con respaldo en caché local.
7. **Microservicio de WhatsApp (`whatsapp-service/`):**
   - Despacho automático de boletos con QR directo al WhatsApp del comprador.

---

## Instrucciones de Instalación y Ejecución

```bash
# 1. Entrar en la carpeta del congreso
cd congreso

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# (Completar con las claves de Supabase)

# 4. Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

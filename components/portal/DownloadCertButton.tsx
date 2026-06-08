"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import QRCode from "qrcode";

type Props = {
  nombre: string;
  apellido: string;
  matricula: string;
  dni?: string;
  isActiva: boolean;
};

export default function DownloadCertButton({ nombre, apellido, matricula, dni, isActiva }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // 1. Configurar jsPDF (Formato A4, Landscape)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // 2. Colores y diseño
      const PRIMARY_COLOR = "#0f3460";
      const SECONDARY_COLOR = "#1abc9c";
      
      // Borde externo
      doc.setDrawColor(15, 52, 96); // #0f3460
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);
      
      // Borde interno decorativo
      doc.setDrawColor(26, 188, 156); // #1abc9c
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 273, 186);

      // 3. Encabezado Oficial
      doc.setTextColor(15, 52, 96);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("COLEGIO DE TERAPIA OCUPACIONAL DE LA RIOJA", 148.5, 30, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Ley Provincial N° 10.355", 148.5, 38, { align: "center" });

      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(40, 45, 257, 45);

      // 4. Título del Certificado
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("CERTIFICADO DE MATRICULACIÓN", 148.5, 65, { align: "center" });

      // 5. Texto de Certificación
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text("El Colegio de Terapia Ocupacional de La Rioja certifica que el/la profesional:", 148.5, 85, { align: "center" });

      // 6. Datos del Profesional
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(26, 188, 156); // #1abc9c
      doc.text(`${nombre} ${apellido}`.toUpperCase(), 148.5, 100, { align: "center" });

      doc.setTextColor(15, 52, 96);
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text(`D.N.I. N°: ${dni || "—"}`, 148.5, 115, { align: "center" });

      // 7. Número de Matrícula
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Se encuentra inscripto/a en este Colegio bajo la", 148.5, 135, { align: "center" });
      
      doc.setFontSize(22);
      doc.text(`MATRÍCULA PROFESIONAL N°: ${matricula}`, 148.5, 145, { align: "center" });

      // 8. Estado y Fecha
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.text("Encontrándose plenamente habilitado/a para el ejercicio de la profesión.", 148.5, 160, { align: "center" });
      
      const fecha = new Date().toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFont("helvetica", "normal");
      doc.text(`La Rioja, Capital — Emitido el ${fecha}`, 148.5, 170, { align: "center" });

      // 9. Generar y añadir el Código QR para validación
      const validationUrl = `${window.location.origin}/validar/${matricula}`;
      const qrDataUrl = await QRCode.toDataURL(validationUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: "#0f3460",
          light: "#ffffff"
        }
      });
      
      // Añadir QR en la esquina inferior izquierda
      doc.addImage(qrDataUrl, "PNG", 20, 160, 30, 30);
      doc.setFontSize(8);
      doc.text("Escanee para validar", 35, 194, { align: "center" });

      // 10. Firmas (Simuladas)
      doc.setDrawColor(15, 52, 96);
      doc.line(200, 175, 260, 175);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Firma Autoridad", 230, 180, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text("Colegio de Terapia Ocupacional", 230, 185, { align: "center" });

      // 11. Descargar
      doc.save(`Certificado_Matricula_COTOLAR_${matricula}.pdf`);
      toast.success("Certificado generado y descargado correctamente");

    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Ocurrió un error al generar el certificado.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!isActiva || isGenerating}
      title={!isActiva ? "Disponible una vez aprobada la matrícula" : ""}
      className="group flex w-full items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#0f3460]/40 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0f3460] transition-colors">
        {isGenerating ? (
          <Loader2 className="h-6 w-6 text-[#0f3460] group-hover:text-white animate-spin transition-colors" />
        ) : (
          <Download className="h-6 w-6 text-[#0f3460] group-hover:text-white transition-colors" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-900 text-sm">Descargar Credencial / Certificado</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {isActiva ? "Descargá tu certificado profesional validable en PDF" : "Disponible tras aprobación de matrícula"}
        </p>
      </div>
    </button>
  );
}

import React from 'react'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Componente para descargar archivo Excel de las DDJJ que han sido cargadas
const ExportExcelComponents = ({ ddjj, error, setErrorMessage }) => {
   
    const exportToExcel = () => {
        if (!ddjj || ddjj?.length == 0 || error) {
            setErrorMessage("No hay datos para exportar en EXCEL");
            return;
        }
        // Crea un nuevo libro de Excel (workbook)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Administradores');

        // Define las columnas de la hoja
        worksheet.columns = [
            { header: '#', key: 'id', width: 5, style: { numFmt: '0' } },
            { header: 'CUIT', key: 'cuit', width: 15, style: { numFmt: '0' } },
            { header: 'N° Comercio', key: 'cod_comercio', width: 15, style: { numFmt: '0' } },
            { header: 'Nombre Comercio / Fantasía', key: 'nombre_comercio', width: 30 },
            { header: 'Monto Declarado', key: 'monto', width: 20, style: { numFmt: '0.00' } },
            { header: 'Tasa a Pagar', key: 'tasa', width: 15, style: { numFmt: '0.00' } },
            { header: 'Fecha', key: 'fecha', width: 10 },
            { header: 'Mes Correspondiente', key: 'mes_correspondiente', width: 35 },
            { header: 'Cargada en Fecha', key: 'en_tiempo', width: 20 },
            { header: 'Rectificada', key: 'rectificada', width: 15 },
            { header: 'Enviada a RAFAM', key: 'en_rafam', width: 20 },
        ];

        // Agrega los datos fila por fila
        ddjj?.forEach((row, index) => {
            worksheet.addRow({
                id: parseFloat(index + 1),
                cuit: parseFloat(row?.cuit),
                cod_comercio: parseFloat(row?.cod_comercio),
                nombre_comercio: row?.nombre_comercio,
                monto: parseFloat(row?.monto_ddjj),
                tasa: parseFloat(row?.tasa_calculada) || 'N/A',
                fecha: new Date(row?.fecha).toLocaleDateString(),
                mes_correspondiente: row?.descripcion_ddjj,
                en_tiempo: row?.cargada_en_tiempo ? 'Sí' : 'No',
                rectificada: row?.rectificada ? 'Rectificada' : 'Sin Rectificar',
                en_rafam: row?.cargada_rafam ? 'Sí' : 'No',
            });
        });

        // Estilo opcional para el encabezado
        worksheet.getRow(1).font = { bold: true };

        // Genera el archivo Excel en un buffer
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            // Guarda el archivo con FileSaver
            saveAs(blob, 'Administradores.xlsx');
        }).catch((err) => {
            setErrorMessage('Error al generar el archivo Excel:', err);
        });
    };

  return (
      <div className="d-flex justify-content-center mt-4">
          <button
              className="btn btn-success rounded-3"
              onClick={exportToExcel}
          >
              <i className="bi bi-file-earmark-excel me-2"></i> Descargar EXCEL
          </button>
      </div>
  )
}

export default ExportExcelComponents
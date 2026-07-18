const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const newImports = `
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FileText, FileSpreadsheet } from 'lucide-react';
`;

code = code.replace(/import \{ formatRupiah \} from '\.\.\/utils\/helpers';/, newImports + "import { formatRupiah } from '../utils/helpers';");

fs.writeFileSync('src/components/AdminPanel.tsx', code);

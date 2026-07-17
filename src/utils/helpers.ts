/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format number to Indonesian Rupiah (IDR)
 * Example: 15000 -> Rp15.000
 */
export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format date to simple Indonesian format
 * Example: 2026-07-17 -> 17 Juli 2026
 */
export const formatTanggal = (dateString: string): string => {
  try {
    const parts = dateString.split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '';

    const d = new Date(datePart);
    if (isNaN(d.getTime())) return dateString;

    const bulanList = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const tanggal = d.getDate();
    const bulan = bulanList[d.getMonth()];
    const tahun = d.getFullYear();

    const formattedDate = `${tanggal} ${bulan} ${tahun}`;
    return timePart ? `${formattedDate} ${timePart.substring(0, 5)}` : formattedDate;
  } catch (e) {
    return dateString;
  }
};

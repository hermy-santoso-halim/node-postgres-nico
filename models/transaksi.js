class transaksi{
    
    constructor(tanggal, keterangan, jumlah,kode_transaksi,id_transaksi) {
        this.id_transaksi = id_transaksi;
        this.tanggal = tanggal;
        this.keterangan = keterangan;
        this.jumlah = jumlah;
        this.kode_transaksi = kode_transaksi;
    }
}

module.exports = transaksi;
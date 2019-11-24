class transaksi{
    
    constructor(id_transaksi, tanggal, keterangan, jumlah) {
        this.id_transaksi = id_transaksi;
        this.tanggal = tanggal;
        this.keterangan = keterangan;
        this.jumlah = jumlah;
    }
}

module.exports = transaksi;
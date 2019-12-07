class transaksi{
    
    constructor(tanggal, keterangan, jumlah,id_transaksi) {
        this.id_transaksi = id_transaksi;
        this.tanggal = tanggal;
        this.keterangan = keterangan;
        this.jumlah = jumlah;
    }
}

module.exports = transaksi;
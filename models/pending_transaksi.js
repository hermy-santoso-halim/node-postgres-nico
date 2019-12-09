class pending_transaksi {
    
    constructor(tgl, keterangan, jmlh,status_transaksi, id_pendingtrans) {
        this.id_pendingtrans = id_pendingtrans;
        this.tgl = tgl;
        this.keterangan = keterangan;
        this.jmlh = jmlh;
        this.status_transaksi =status_transaksi;
    }
}

module.exports = pending_transaksi;
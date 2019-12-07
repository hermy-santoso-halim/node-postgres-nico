class pending_transaksi {
    
    constructor(tgl, keterangan, jmlh, id_pendingtrans) {
        this.id_pendingtrans = id_pendingtrans;
        this.tgl = tgl;
        this.keterangan = keterangan;
        this.jmlh = jmlh;
    }
}

module.exports = pending_transaksi;
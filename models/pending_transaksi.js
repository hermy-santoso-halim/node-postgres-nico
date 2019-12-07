class pending_transaksi {
    
    constructor(tgl, keterangan, jmlh, id_pendingtrans,keterangan2) {
        this.id_pendingtrans = id_pendingtrans;
        this.tgl = tgl;
        this.keterangan = keterangan;
        this.jmlh = jmlh;
        this.keterangan2 = keterangan2;
    }
}

module.exports = pending_transaksi;
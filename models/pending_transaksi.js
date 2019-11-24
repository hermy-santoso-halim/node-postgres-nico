class pending_transaksi {
    
    constructor(id_pendingtrans, tgl, keterangan, jmlh) {
        this.id_pendingtrans = id_pendingtrans;
        this.tgl = tgl;
        this.keterangan = keterangan;
        this.jmlh = jmlh;
    }
}

module.exports = pending_transaksi;
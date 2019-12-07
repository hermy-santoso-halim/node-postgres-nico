class biaya {
    
    constructor(nama, harga, tgl_trans, grup_biaya,id) {
        this.id = id;
        this.nama = nama;
        this.harga = harga;
        this.tgl_trans = tgl_trans;
        this.grup_biaya=grup_biaya;
    }
}

module.exports = biaya;
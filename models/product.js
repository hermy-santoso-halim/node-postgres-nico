class product {
    
    constructor(plat, merk, tipe, tahun, pajak, hrg_beli, tgl_beli, image,status_jual,harga_jual,tgl_jual, pembeli) {
        this.plat = plat;
        this.merk = merk;
        this.tipe = tipe;
        this.tahun = tahun;
        this.pajak = pajak;
        this.hrg_beli = hrg_beli;
        this.tgl_beli = tgl_beli;
        this.image = image;
        this.status_jual = status_jual;
        this.harga_jual = harga_jual;
        this.tgl_jual = tgl_jual;
        this.pembeli = pembeli;
    }
}

module.exports = product;
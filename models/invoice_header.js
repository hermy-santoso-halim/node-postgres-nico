class invoice_header {
    
    constructor(creator, tgl, list_pending, notes_payment, no_rek,bank_rek, nama_rek,invoice_no) {
        this.invoice_no = invoice_no;
        this.creator = creator;
        this.tgl = tgl;
        this.list_pending = list_pending;
        this.notes_payment = notes_payment;
        this.no_rek = no_rek;
        this.bank_rek = bank_rek;
        this.nama_rek = nama_rek;

    }
}

module.exports = invoice_header;
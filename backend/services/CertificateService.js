// Cert service
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Certificate from '../models/Certificate.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import Program from '../models/Program.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CertificateService {
    constructor() {
        // Ensure dir
        this.certificatesDir = path.join(__dirname, '..', 'certificates');
        if (!fs.existsSync(this.certificatesDir)) {
            fs.mkdirSync(this.certificatesDir, { recursive: true });
        }
    }

    // Generate 80G PDF
    async generate80GCertificate(certificateData) {
        const { donationId, userId, amount, programId } = certificateData;

        // Get details
        const donation = await Donation.findById(donationId);
        const user = await User.findById(userId);
        const program = await Program.findById(programId);

        if (!donation || !user || !program) {
            throw new Error('Invalid donation, user, or program data');
        }

        // Unique filename
        const filename = `80G_${donationId}_${Date.now()}.pdf`;
        const filepath = path.join(this.certificatesDir, filename);

        // Create PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const writeStream = fs.createWriteStream(filepath);

        doc.pipe(writeStream);

        // Add content
        this.addCertificateHeader(doc);
        this.addCertificateBody(doc, {
            donorName: user.name,
            amount,
            date: donation.createdAt,
            programName: program.programName,
            donationId: donation._id.toString(),
            razorpayPaymentId: donation.razorpayPaymentId,
        });
        this.addCertificateFooter(doc);

        doc.end();

        // Wait for PDF to be written
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Store record
        const certificateURL = `/certificates/${filename}`;
        await Certificate.create({
            donationId,
            certificateType: '80G',
            certificateURL,
        });

        return { certificateURL };
    }

    /**
     * Generate 12A certificate PDF
     * @param {Object} certificateData 
     * @returns {Promise<Object>} 
     */
    async generate12ACertificate(certificateData) {
        const { donationId, userId, amount, programId } = certificateData;

        const donation = await Donation.findById(donationId);
        const user = await User.findById(userId);
        const program = await Program.findById(programId);

        if (!donation || !user || !program) {
            throw new Error('Invalid donation, user, or program data');
        }

        const filename = `12A_${donationId}_${Date.now()}.pdf`;
        const filepath = path.join(this.certificatesDir, filename);

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const writeStream = fs.createWriteStream(filepath);
        doc.pipe(writeStream);

        // Header
        doc
            .fontSize(24).font('Helvetica-Bold')
            .text(process.env.FOUNDATION_NAME || 'Nonprofit Foundation', { align: 'center' })
            .moveDown(0.5);
        doc
            .fontSize(12).font('Helvetica')
            .text(process.env.FOUNDATION_ADDRESS || 'Foundation Address', { align: 'center' })
            .moveDown(0.3);
        doc
            .fontSize(10)
            .text(`Registration No: ${process.env.FOUNDATION_REGISTRATION_NUMBER || 'N/A'}`, { align: 'center' })
            .moveDown(1);
        doc
            .fontSize(20).font('Helvetica-Bold')
            .text('REGISTRATION CERTIFICATE', { align: 'center' })
            .moveDown(0.5);
        doc
            .fontSize(14).font('Helvetica')
            .text('(Under Section 12A of Income Tax Act, 1961)', { align: 'center' })
            .moveDown(2);

        // Body
        doc.fontSize(12).font('Helvetica');
        doc.text('This is to certify that the following donation has been received by the organization registered under Section 12A of the Income Tax Act, 1961.', { align: 'justify' }).moveDown(1.5);

        doc.font('Helvetica-Bold').fontSize(14).text(`Donor: ${user.name}`, { align: 'left' }).moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(16).text(`Amount: Rs. ${amount.toLocaleString('en-IN')}`, { align: 'left' }).moveDown(0.5);
        doc.font('Helvetica').fontSize(12).text(`Program: ${program.programName}`).moveDown(0.5);
        doc.text(`Date: ${new Date(donation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`).moveDown(0.5);
        doc.fontSize(10).text(`Donation ID: ${donationId}`).moveDown(0.3);
        doc.text(`Transaction ID: ${donation.razorpayPaymentId || 'N/A'}`).moveDown(2);

        doc.fontSize(11).text('This organization is registered under Section 12A and the donation is eligible for tax exemption as per applicable provisions.', { align: 'justify' }).moveDown(1);

        // Footer
        this.addCertificateFooter(doc);
        doc.end();

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        const certificateURL = `/certificates/${filename}`;
        await Certificate.create({
            donationId,
            certificateType: '12A',
            certificateURL,
        });

        return { certificateURL };
    }

    // Add header
    addCertificateHeader(doc) {
        doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text(process.env.FOUNDATION_NAME || 'Nonprofit Foundation', {
                align: 'center',
            })
            .moveDown(0.5);

        doc
            .fontSize(12)
            .font('Helvetica')
            .text(process.env.FOUNDATION_ADDRESS || 'Foundation Address', {
                align: 'center',
            })
            .moveDown(0.3);

        doc
            .fontSize(10)
            .text(
                `Registration No: ${process.env.FOUNDATION_REGISTRATION_NUMBER || 'N/A'}`,
                { align: 'center' }
            )
            .moveDown(1);

        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('DONATION CERTIFICATE', { align: 'center' })
            .moveDown(0.5);

        doc
            .fontSize(14)
            .font('Helvetica')
            .text('(Under Section 80G of Income Tax Act, 1961)', {
                align: 'center',
            })
            .moveDown(2);
    }

    // Add body
    addCertificateBody(doc, data) {
        const { donorName, amount, date, programName, donationId, razorpayPaymentId } = data;

        doc.fontSize(12).font('Helvetica');

        doc.text('This is to certify that', { continued: false }).moveDown(1);

        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .text(donorName, { align: 'center' })
            .moveDown(1);

        doc.fontSize(12).font('Helvetica');

        doc
            .text('has made a generous donation of', { continued: false })
            .moveDown(0.5);

        doc
            .font('Helvetica-Bold')
            .fontSize(16)
            .text(`Rs. ${amount.toLocaleString('en-IN')}`, { align: 'center' })
            .moveDown(0.5);

        doc.fontSize(12).font('Helvetica');

        doc
            .text(`towards the program: ${programName}`, { continued: false })
            .moveDown(0.5);

        doc
            .text(`on ${new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })}`)
            .moveDown(1.5);

        doc
            .fontSize(10)
            .text(`Donation ID: ${donationId}`, { continued: false })
            .text(`Transaction ID: ${razorpayPaymentId}`)
            .moveDown(2);

        doc
            .fontSize(11)
            .text(
                'This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.',
                { align: 'justify' }
            )
            .moveDown(1);
    }

    // Add footer
    addCertificateFooter(doc) {
        doc.moveDown(3);

        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Date of Issue: ${new Date().toLocaleDateString('en-IN')}`, {
                align: 'left',
            })
            .moveDown(2);

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Authorized Signatory', { align: 'right' })
            .moveDown(0.3);

        doc
            .fontSize(10)
            .font('Helvetica')
            .text(process.env.FOUNDATION_NAME || 'Nonprofit Foundation', {
                align: 'right',
            });

        // Add footer note
        doc
            .moveDown(2)
            .fontSize(8)
            .font('Helvetica')
            .text(
                'This is a computer-generated certificate and does not require a physical signature.',
                { align: 'center', color: 'gray' }
            );
    }

    // Get by donation
    async getCertificateByDonation(donationId) {
        const certificate = await Certificate.findOne({ donationId }).lean();

        if (!certificate) {
            throw new Error('Certificate not found');
        }

        return {
            certificateType: certificate.certificateType,
            certificateURL: certificate.certificateURL,
            issuedDate: certificate.issuedDate,
        };
    }

    // Get file path
    getCertificateFilePath(filename) {
        return path.join(this.certificatesDir, filename);
    }
}

export default new CertificateService();

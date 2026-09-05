const PDFDocument = require('pdfkit');
const Result = require('../models/Result');

// @desc Generate a certificate for a specific result
// @route Get /api/results/:id/certificate
// @access Public 
const generateCertificate = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate('candidate', 'name')
            .populate('programme', 'name date')
        
        if (!result) {
            return res.status(404).json({ message: 'Result not found'})
        }

        const { candidate, programme, rank, grade } = result;
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
        })
        // Set response headers to trigger a download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="certificate_${candidate.name}_${programme.name}.pdf"`);

// Pipe the PDF content directly to the response
doc.pipe(res);

// Modern color palette
const colors = {
  primary: '#4361ee',
  secondary: '#3a0ca3',
  accent: '#f72585',
  success: '#4cc9f0',
  background: '#f8f9fa',
  text: '#2b2d42'
};

// Add gradient background
const gradient = doc.linearGradient(0, 0, doc.page.width, doc.page.height);
gradient.stop(0, '#667eea')
       .stop(1, '#764ba2');

doc.rect(0, 0, doc.page.width, doc.page.height)
   .fill(gradient);

// Main content container with modern styling
doc.roundedRect(30, 30, doc.page.width - 60, doc.page.height - 60, 15)
   .fill(colors.background)
   .stroke(colors.primary);

// Decorative elements - floating shapes
doc.circle(100, 100, 40).fill(colors.accent).opacity(0.3);
doc.rect(doc.page.width - 140, doc.page.height - 120, 60, 60)
   .fill(colors.success)
   .rotate(45)
   .opacity(0.2);

// Title with modern styling
doc.fontSize(42)
   .font('Helvetica-Bold')
   .fillColor(colors.primary)
   .text('Certificate of Achievement', { 
     align: 'center',
     y: 80
   });

// Decorative line under title
doc.moveTo(100, 140)
   .lineTo(doc.page.width - 100, 140)
   .strokeColor(colors.accent)
   .lineWidth(3)
   .stroke();

doc.moveDown(1.5);

// "Presented to" text with modern styling
doc.fontSize(18)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Proudly presented to', {
     align: 'center',
     y: 180
   });

// Candidate name with emphasis
doc.fontSize(44)
   .font('Helvetica-Bold')
   .fillLinearGradient(100, 230, 400, 270, colors.primary, colors.secondary)
   .text(candidate.name, {
     align: 'center',
     y: 210
   });

doc.moveDown(2);

// Achievement text container
const achievementBox = {
  x: 80,
  y: 320,
  width: doc.page.width - 160,
  height: 120
};

doc.roundedRect(achievementBox.x, achievementBox.y, 
               achievementBox.width, achievementBox.height, 10)
   .fill(colors.primary)
   .opacity(0.1)
   .stroke(colors.primary)
   .opacity(0.3);

let achievementText = `for their outstanding performance in the programme`;
doc.fontSize(20)
   .font('Helvetica')
   .fillColor(colors.text)
   .text(achievementText, {
     align: 'center',
     width: achievementBox.width - 40,
     x: achievementBox.x + 20,
     y: achievementBox.y + 20
   });

// Programme name with badge styling
const programmeBadge = {
  x: (doc.page.width - 300) / 2,
  y: achievementBox.y + 70,
  width: 300,
  height: 40
};

doc.roundedRect(programmeBadge.x, programmeBadge.y, 
               programmeBadge.width, programmeBadge.height, 20)
   .fillLinearGradient(programmeBadge.x, programmeBadge.y, 
                      programmeBadge.x + programmeBadge.width, 
                      programmeBadge.y + programmeBadge.height,
                      colors.primary, colors.secondary);

doc.fontSize(22)
   .font('Helvetica-Bold')
   .fillColor('#ffffff')
   .text(programme.name, {
     align: 'center',
     y: programmeBadge.y + 8
   });

doc.moveDown(3);

// Rank and grade section with modern cards
if (rank || grade) {
  const statsY = programmeBadge.y + 80;
  const cardWidth = 200;
  const spacing = 40;
  const totalWidth = (rank && grade) ? (cardWidth * 2 + spacing) : cardWidth;
  const startX = (doc.page.width - totalWidth) / 2;
  
  if (rank) {
    // Rank card
    doc.roundedRect(startX, statsY, cardWidth, 80, 10)
       .fill(colors.success)
       .opacity(0.1)
       .stroke(colors.success);
    
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor(colors.text)
       .text('Achieved Rank', {
         align: 'center',
         x: startX,
         width: cardWidth,
         y: statsY + 15
       });
    
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(colors.success)
       .text(rank, {
         align: 'center',
         x: startX,
         width: cardWidth,
         y: statsY + 40
       });
  }
  
  if (grade) {
    // Grade card
    const gradeX = rank ? startX + cardWidth + spacing : startX;
    
    doc.roundedRect(gradeX, statsY, cardWidth, 80, 10)
       .fill(colors.accent)
       .opacity(0.1)
       .stroke(colors.accent);
    
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor(colors.text)
       .text('Final Grade', {
         align: 'center',
         x: gradeX,
         width: cardWidth,
         y: statsY + 15
       });
    
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(colors.accent)
       .text(grade, {
         align: 'center',
         x: gradeX,
         width: cardWidth,
         y: statsY + 40
       });
  }
}

// Footer with decorative elements
const footerY = doc.page.height - 80;
doc.moveTo(100, footerY)
   .lineTo(doc.page.width - 100, footerY)
   .strokeColor(colors.primary)
   .lineWidth(2)
   .opacity(0.5)
   .stroke();

doc.fontSize(12)
   .font('Helvetica')
   .fillColor(colors.text)
   .opacity(0.7)
   .text('Issued on ' + new Date().toLocaleDateString(), {
     align: 'center',
     y: footerY + 20
   });

doc.end();
    }
    catch (error) {
        console.error(`Error while generating certificate ${error.message}`);
        res.status(500).json({ message: 'Server Error'})
    }
}

module.exports = {
    generateCertificate,
}
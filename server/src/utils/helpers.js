const cloudinary = require("../config/cloudinary");

// Upload image to Cloudinary from buffer
exports.uploadToCloudinary = async (fileBuffer, folder = "farm2door") => {
  const placeholder = {
    public_id: `placeholder_${Date.now()}`,
    url: `https://placehold.co/400x400/0EA5E9/FFFFFF?text=Farm2Door`,
  };

  try {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
            });
        }
      );

      stream.end(fileBuffer);
    });
  } catch (error) {
    console.warn(
      "Cloudinary upload failed, using placeholder:",
      error.message
    );
    return placeholder;
  }
};

// Delete image from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn("Cloudinary delete failed:", error.message);
  }
};

// Upload multiple images
exports.uploadMultiple = async (files, folder = "farm2door") => {
  const uploads = files.map((file) =>
    exports.uploadToCloudinary(file.buffer, folder)
  );
  return Promise.all(uploads);
};

// Send email
exports.sendEmail = async ({ to, subject, html }) => {
  if (process.env.SMTP_EMAIL) {
    try {
      const nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // required for Gmail on 587
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();
      console.log("✅ SMTP server connected");

      await transporter.sendMail({
        from: `Farm2Door <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error("❌ MAIL ERROR FULL:", error);
      throw error;
    }
  } else {
    console.log(`📧 [DEV MODE] Email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);
  }
};

// Generate invoice number
exports.generateInvoiceNumber = () => {
  const prefix = "F2D-INV";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate distance between two coordinates (Haversine formula)
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Async handler wrapper
exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Pagination helper
exports.getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 12, 50);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
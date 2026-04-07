import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { getUserEmail } from "../utils/getUserEmail.js";
import sendEmail from "../utils/sendEmail.js";


// ================= INTERNAL FUNCTION =================
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate }
    });
    return bookings.length === 0;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};


// ================= CHECK ROOM AVAILABILITY =================
export const checkRoomAvailability = async (req, res) => {
  try {

    const { room, checkInDate, checkOutDate } = req.body;

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room
    });

    res.json({ success: true, isAvailable });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



// ================= CREATE BOOKING =================
export const createBooking = async (req, res) => {

  try {

    const { room, checkInDate, checkOutDate, guests } = req.body;

    const user = req.auth.userId;

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room
    });

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room is not available for the selected dates"
      });
    }

    const roomData = await Room.findById(room).populate("hotel");

    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)
    );

    const totalPrice = roomData.pricePerNight * nights;

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: Number(guests),
      checkInDate,
      checkOutDate,
      totalPrice
    });

    // ================= EMAIL =================
    try {
      const userEmail = await getUserEmail(user);

      await sendEmail(
        userEmail,
        "Booking Confirmation",
        `
Booking Confirmed!

Hotel: ${roomData.hotel.name}
Location: ${roomData.hotel.address}
Guests: ${guests}
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Total Price: ₹${totalPrice}

Thank you for booking with us!
`
      );

      console.log("✅ Email sent");

    } catch (mailErr) {
      console.log("❌ EMAIL FAILED:", mailErr.message);
    }

    res.json({
      success: true,
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



// ================= USER BOOKINGS =================
export const getUserBookings = async (req, res) => {

  try {

    const bookings = await Booking.find({ user: req.auth.userId })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });

  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }

};



// ================= OWNER DASHBOARD BOOKINGS =================
export const getHotelBookings = async (req, res) => {

  try {

    const hotel = await Hotel.findOne({ owner: req.auth.userId });

    if (!hotel) {
      return res.json({ success: false, message: "Hotel not found" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    // 🔥 FIX: attach user email
    const updatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const email = await getUserEmail(booking.user);

        return {
          ...booking._doc,
          user: {
            email
          }
        };
      })
    );

    const totalBookings = updatedBookings.length;

    const totalRevenue = updatedBookings.reduce(
      (acc, b) => acc + b.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: {
        totalBookings,
        totalRevenue,
        bookings: updatedBookings.slice(0, 5)
      }
    });

  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }

};
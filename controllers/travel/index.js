const Travel = require("../../models/Travel");
const { handleFileOperations } = require("../../helpers");
const { convertToUTCDate } = require("../../helpers");
const { ApiResponse } = require("../../helpers");

exports.addTravelExpense = async (req, res) => {
  const userId = req.user._id;
  const {
    from,
    to,
    departureDate,
    arrivalDate,
    flightExpense,
    hotelExpense,
    mealExpense,
    carRentalExpense,
    otherExpense,
  } = req.body;

  try {
    let departureDateUTC, arrivalDateUTC;

    // Verify the departureDate
    if (departureDate) {
      departureDateUTC = new Date(departureDate);
      if (isNaN(departureDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid departure date", false));
      }
    } else {
      return res
        .status(400)
        .json(ApiResponse({}, "Departure date is required", false));
    }

    // Verify the arrivalDate
    if (arrivalDate) {
      arrivalDateUTC = new Date(arrivalDate);
      if (isNaN(arrivalDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid arrival date", false));
      }

      // Arrival date should be greater than departure date
      if (arrivalDateUTC <= departureDateUTC) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Arrival date should be greater than departure date",
              false
            )
          );
      }
    }

    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    const travel = new Travel({
      userId,
      from,
      to,
      departureDate: departureDateUTC,
      arrivalDate: arrivalDateUTC,
      flightExpense,
      hotelExpense,
      mealExpense,
      carRentalExpense,
      otherExpense,
      attachments,
    });

    // Save travel expense record
    await travel.save();

    return res
      .status(201)
      .json(ApiResponse(travel, "Travel expense added successfully", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

"use client";

import {
  add,
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContext";

function isAlreadyBooked(range, datesArr) {
  return (
    range.from &&
    range.to &&
    datesArr.some((date) =>
      isWithinInterval(date, { start: range.from, end: range.to })
    )
  );
}

//
function getUnavailableDays(arr, minLength) {
  const today = startOfDay(new Date());

  const daysArray = [];

  if (differenceInDays(arr.at(0), today) < minLength && !isPast(arr.at(0))) {
    const diffDays = differenceInDays(startOfDay(arr.at(0)), today);

    for (let i = 0; i < diffDays; i++) {
      const currentDate = add(today, { days: i });
      daysArray.push(startOfDay(currentDate));
    }
  }

  return daysArray;
}

function DateSelector({ settings, bookedDates, cabin }) {
  const { range, setRange, resetRange } = useReservation();

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range;

  const { regularPrice, discount } = cabin;

  const numNights = differenceInDays(displayRange.to, displayRange.from);
  const cabinPrice = (regularPrice - discount) * numNights;

  // SETTINGS
  const { minBookingLength, maxBookingLength } = settings;

  //handle unavailable days
  const sortedBookedDates = bookedDates
    .map((date) => date.getTime())
    .slice()
    .sort((a, b) => a - b)
    .map((time) => new Date(time));

  const unavailableDays = getUnavailableDays(
    sortedBookedDates,
    minBookingLength
  );

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center"
        mode="range"
        selected={displayRange}
        onSelect={(range) => setRange(range)}
        disabled={[...unavailableDays, ...bookedDates, new Date()]}
        // disabled={(curdate) =>
        //   isPast(curdate) ||
        //   bookedDates.some((date) => isSameDay(date, curdate))
        // }

        min={minBookingLength + 1}
        max={maxBookingLength}
        // fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={2}
      />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-baseline gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;

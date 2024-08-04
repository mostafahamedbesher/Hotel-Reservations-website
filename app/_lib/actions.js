"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import {
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
  updateGuest,
} from "./data-service";
import { redirect } from "next/navigation";

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateGuestProfile(formData) {
  // check authentication & authoriazation
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  //check that nationalID is correct
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
    throw new Error("please insert a valid NationalID");
  }

  const updateData = {
    nationalID,
    nationality,
    countryFlag,
  };

  //update guest data in the database
  await updateGuest(session.user.guestId, updateData);

  //manual revalidate cache
  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  // check authentication & authoriazation
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  //make the current user delete his own bookings only(protecting other guests Bookings)
  const guestBookings = await getBookings(session.user.guestId);
  const bookingIds = guestBookings.map((booking) => booking.id);
  if (!bookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to delete this Booking!!");
  }

  //Delete booking
  await deleteBooking(bookingId);

  //manual revalidate cache
  revalidatePath("/account/reservations");
}

export async function updateReservation(formData) {
  // check authentication & authoriazation
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  //make the current user update his own bookings only(protecting other guests Bookings)
  const guestBookings = await getBookings(session.user.guestId);
  const bookingId = formData.get("bookingId");
  const bookingIds = guestBookings.map((booking) => booking.id);
  if (!bookingIds.includes(Number(bookingId))) {
    throw new Error("You are not allowed to update this Booking!!");
  }

  //update Reservation
  const observations = formData.get("observations").slice(0, 1000); // get only first 1000 characters
  const numGuests = Number(formData.get("numGuests"));

  const updateData = {
    numGuests,
    observations,
  };

  await updateBooking(bookingId, updateData);

  //manual revalidate cache
  revalidatePath(`/account/reservations/edit/${bookingId}`);

  //redirect user to his reservations page
  redirect("/account/reservations", "replace");
}

export async function createReservation(reservationData, formData) {
  // check authentication & authoriazation
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  //get form data
  const observations = formData.get("observations").slice(0, 1000); // get only first 1000 characters
  const numGuests = Number(formData.get("numGuests"));

  //create reservation data object
  const newBooking = {
    numGuests,
    observations,
    ...reservationData,
  };

  if (!reservationData.startDate || !reservationData.endDate || !numGuests) {
    throw new Error("Please Insert Correct Data");
  }

  //create booking
  await createBooking(newBooking);

  //manual revalidate cache
  revalidatePath(`/cabins/${reservationData.cabinId}`);

  //redirect user to his reservations page
  redirect("/cabins/thank-you", "replace");
}

import SubmitButton from "@/app/_components/SubmitButton";

import { updateReservation } from "@/app/_lib/actions";
import { getBooking, getCabin } from "@/app/_lib/data-service";

//genetate dymanic metadata
export async function generateMetadata({ params }) {
  return {
    title: `Reservation ${params.bookingId}`,
  };
}

export default async function Page({ params }) {
  const { cabinId, numGuests, observations } = await getBooking(
    params.bookingId
  );

  const { maxCapacity } = await getCabin(cabinId);

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{params.bookingId}
      </h2>

      <form
        action={updateReservation}
        className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            defaultValue={numGuests}
            required
          >
            {/* <option value="" key="">
              Select number of guests...
            </option> */}

            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            defaultValue={observations}
          />
        </div>

        {/* hidden input used to pass bookingId to form when submitting using server action(updateReservation) */}
        <input hidden name="bookingId" value={params.bookingId} />

        <div className="flex justify-end items-center gap-6">
          <SubmitButton loadingText="Updating...">
            Update Reservation
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

// function Button() {
//   const { pending } = useFormStatus();

//   return (
//     <button
//       disabled={pending}
//       className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
//     >
//       {pending ? "Updating..." : "Update reservation"}
//     </button>
//   );
// }

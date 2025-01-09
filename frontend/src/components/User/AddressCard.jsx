import React from "react";
import { Link } from "react-router-dom";

const AddressCard = ({ address, onDelete }) => {
  return (
    <div className="flex flex-col justify-between border border-gray-300 rounded-lg p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
      {/* Address Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          address.name
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          address.street
        </p>
        <p className="text-sm text-gray-600 mb-2">address.city</p>
        <p className="text-sm text-gray-600 mb-2">address.state</p>
        <p className="text-sm text-gray-600 mb-2">address.country</p>
        <p className="text-sm text-gray-600 mb-2">ZIP: address.zipCod</p>
        <p className="text-sm text-gray-600">Phone: address.phone</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-1 flex justify-between items-center">
        <Link
        //   to={`/edit-address/${address.id}`} 
          className="px-4 py-2 text-sm text-white bg-violet-900 rounded-md hover:bg-violet-800 transition-colors"
        >
          Edit
        </Link>
        <button
        //   onClick={() => onDelete(address.id)} 
          className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
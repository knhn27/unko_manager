import React from "react";
import { Smile } from "lucide-react";

type Props = {
  message: string;
};

const HealthMessage = ({ message }: Props) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <div className="flex items-center gap-3">
      <Smile className="text-green-500 w-6 h-6" />
      <h2 className="text-lg font-semibold text-gray-800">今週の健康状況</h2>
    </div>
    <p className="mt-2 text-gray-700">{message}</p>
  </div>
);

export default HealthMessage; 
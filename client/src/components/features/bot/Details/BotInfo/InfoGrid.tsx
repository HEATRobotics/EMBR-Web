type InfoItem = {
  title: string;
  value: string | number;
};

interface InfoGridProps {
  data: InfoItem[];
}

function InfoGrid({ data }: InfoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center p-4 rounded-md bg-white shadow-sm"
        >
          <span className="text-sm font-medium text-gray-500 text-center mb-2">{item.title}</span>
          <span className="text-3xl font-bold text-gray-900 text-center">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default InfoGrid;

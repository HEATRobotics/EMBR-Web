type InfoItem = {
    title: string;
    value: string | number;
};

interface InfoGridProps {
    data: InfoItem[];
}

function InfoGrid({ data }: InfoGridProps) {
    return (
        <div className="grid grid-cols-2 gap-0 w-full p-0"
             style={{ backgroundColor: "rgba(62, 60, 56, 0.5)" }}>
            {data.map((item, index) => (
                <div
                    key={index}
                    className="flex flex-col items-center justify-center h-32 p-6 
                               rounded-[29px] bg-[#383838] 
                               transition-transform duration-300
                               shadow-[1px_1px_13px_#343434,-1px_-1px_13px_#2b2b2bf2]
                               hover:scale-105 hover:shadow-[0_0_25px_#ea7d39] m-2 group hover:shadow-lg hover:scale-105 transition transform duration-200 "
                >
          <span className="text-l font-semibold text-800 text-center mb-2"
                style=
                {{ color: "#ded5cfff" ,
                 }}
                >
            {item.title}
          </span>
                    <span className="text-xl font-bold text-900 text-center "
                    style=
                    {{ color: "#d2cfdeff" ,
                    }}
                >
            {item.title === "Speed" || item.title === "Ground Speed"
              ? (isNaN(parseFloat(item.value))
                 ? item.value
                 : parseFloat(item.value).toFixed(2))
              : item.value}
           
          </span>
                </div>
            ))}
        </div>
    );
}

export default InfoGrid;

 //{item.value}
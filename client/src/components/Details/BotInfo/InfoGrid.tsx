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
                    className="flex flex-col items-center justify-center h-32 p-6 rounded-md shadow-sm m-2  group hover:shadow-lg hover:scale-105 transition transform duration-200"
                    style={{ backgroundColor: "#1e1e1eff" }}
                >
          <span className="text-sm font-semibold text-800 text-center mb-2"
                style=
                {{ color: "#ded5cfff" ,
                    fontfamily: "Epilogue, sans-serif"
                 }}
                >
            {item.title}
          </span>
                    <span className="text-xl font-bold text-900 text-center group-hover:underline transition duration-200"
                    style=
                    {{ color: "#d2cfdeff" ,
                        fontfamily: "Rubik, sans-serif",
                        textDecorationColor: "#ea7d395b"
                    }}
                >
            {item.value}
          </span>
                </div>
            ))}
        </div>
    );
}

export default InfoGrid;
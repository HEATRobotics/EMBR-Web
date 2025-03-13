import React, { ReactNode } from "react";
import Tag from "@/components/FleetDetails/Tag";

type Props = {
  children?: ReactNode;
  title?: string;
  button?: string;
};

const Box: React.FC<Props> = ({
  children,
  title = "Default Title",
  button,
}) => {
  return (
    <div className="w-full my-4 px-7 border-2 rounded-[20px] border-black p-[35px]">
      {button ? (
        <div className="flex justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <Tag
            label={button}
            url="https://viewer.autodesk.com/id/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YTM2MHZpZXdlci1wcm90ZWN0ZWQvdDE3MTQ1Mzg4NDNfZTU5NGU0MmYtOWRmYi00ZDYyLWExYTctZTUxMzJlYTMzODU0LnNsZGFzbQ?sheetId=MDI4NzQ3MmYtYWY1ZS00YTRlLTg1MTctMDcxZWU3MTk1ZTY2"
          />
        </div>
      ) : (
        <div className="text-lg font-semibold">{title}</div>
      )}
      {children}
    </div>
  );
};

export default Box;

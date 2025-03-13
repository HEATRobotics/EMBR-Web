import React from 'react';
import { getTagStyle } from '@/utils/getTagStyle';

interface TagProps {
    label: string;
    url?: string;
}

const Tag: React.FC<TagProps> = ({ label, url }) => {
    const style = getTagStyle(label);

    if (url) {
        return <a href={url} target="_blank" rel="noopener noreferrer" style={style}>{label}</a>;
    } else {
        return <span style={style}>{label}</span>;
    }
};

export default Tag;

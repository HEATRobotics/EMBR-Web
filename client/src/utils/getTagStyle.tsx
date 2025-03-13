export const getTagStyle = (label: string): React.CSSProperties => {
    switch (label) {
        case 'active':
            return { backgroundColor: '#007205', color: 'white', borderRadius: '50px', padding: '5px 10px', fontSize: "10px", height: "25px" };
        case 'attention required':
            return { backgroundColor: '#FF3131', color: 'white', borderRadius: '50px', padding: '5px 10px', fontSize: "10px", height: "25px" };
        case 'view snapshots':
            return { backgroundColor: '#FF5001', color: 'white', borderRadius: '50px', padding: '5px 10px', fontSize: "10px", height: "25px" };
        default:
            return { backgroundColor: '#FF5001', color: 'white', borderRadius: '50px', padding: '5px 10px', fontSize: "10px", height: "25px" };
    }
};

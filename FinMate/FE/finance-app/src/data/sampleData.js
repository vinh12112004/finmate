const today = new Date();
const isoDaysAgo = (days) => {
    const date = new Date(today);
    date.setDate(today.getDate() - days);
    return date.toISOString().slice(0, 10);
};

export const sampleTransactions = [
    {
        id: "tx-1",
        title: "Cà phê trong khuôn viên",
        amount: 25000,
        category: "Ăn uống",
        date: isoDaysAgo(0),
        note: "Bữa sáng trước giờ học",
        type: "expense",
    },
    {
        id: "tx-2",
        title: "Vé xe buýt tuần",
        amount: 50000,
        category: "Di chuyển",
        date: isoDaysAgo(1),
        note: "Vé đi lại trong tuần",
        type: "expense",
    },
    {
        id: "tx-3",
        title: "Nhà sách đại học",
        amount: 85000,
        category: "Học tập",
        date: isoDaysAgo(4),
        note: "Tài liệu môn học",
        type: "expense",
    },
    {
        id: "tx-4",
        title: "Tiền dạy kèm",
        amount: 45000,
        category: "Thu nhập",
        date: isoDaysAgo(4),
        note: "Buổi dạy kèm",
        type: "income",
    },
    {
        id: "tx-5",
        title: "Spotify Premium",
        amount: 200000,
        category: "Đăng ký",
        date: isoDaysAgo(8),
        note: "Gói đăng ký hằng tháng",
        type: "expense",
    },
];

export const sampleSettings = {
    displayName: "Alex M.",
    monthlyBudget: 850,
    currency: "VND",
    smartAlerts: true,
    subscriptionAlerts: true,
};

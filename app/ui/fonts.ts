import localFont from "next/font/local";

export const inter = localFont({
    src: '../../assets/fonts/Inter-Black.woff2'
});

export const lusitana = localFont({
    src: [
        { path: "../../assets/fonts/Lusitana-Regular.woff2", weight: "400" },
        { path: "../../assets/fonts/Lusitana-Bold.woff2", weight: "700" }
    ],
});

import { Header } from "./header";

export function  GuestTemplate({ children }: { children: React.ReactNode }) {

    return <main className="guest-template">
        <Header />
        {children}
    </main>;
}
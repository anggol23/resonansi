import { Footer } from "flowbite-react";

export default function FooterCom() {
  return (
    <Footer container className="mt-auto">
      <div className="w-full text-center">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
          {/* <Footer.LinkGroup>
            <Footer.Link href="/resonansi">Resonansi</Footer.Link>
            <Footer.Link href="/artikel">Artikel</Footer.Link>
            <Footer.Link href="/kirim-tulisan">Kirim Tulisan</Footer.Link>
            <Footer.Link href="/redaksi">Redaksi</Footer.Link>
            <Footer.Link href="/unduhan">Unduhan</Footer.Link>
          </Footer.LinkGroup> */}
        </div>
        <Footer.Divider />
        <Footer.Copyright href="/" by="STUPER™" year={2025} />
      </div>
    </Footer>
  );
}

import Link from 'next/link';

export default function Custom404() {
  return (
    <div id="notfound">
      <div className="notfound">
        <div className="notfound-404">
          <h1>Oops!</h1>
          <h2>404 - The Page can't be found</h2>
        </div>
        <Link href={'/'}>Go TO Homepage</Link>
      </div>
    </div>
  );
}

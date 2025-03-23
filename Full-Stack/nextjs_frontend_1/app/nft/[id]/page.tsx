import NFTDetailsClient from './NFTDetailsClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default function NFTDetailsPage({ params }: { params: { id: string } }) {
  return <NFTDetailsClient id={params.id} />;
} 
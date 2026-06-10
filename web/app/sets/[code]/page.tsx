import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function Page({ params }: Props) {
  const { code } = await params;
  redirect(`/swu/sets/${code}`);
}

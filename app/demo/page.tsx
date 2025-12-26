import { turso } from "@/db";
import Editor from "./editor";

export default async function EditorPage() {
  const {rows} = await turso.execute("SELECT 1");
  console.log(rows);
  return (
    <>
      <Editor />
    </>
  );
}

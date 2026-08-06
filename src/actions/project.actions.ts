"use server";

export type ProjectActionState = {
  success: boolean;
  error: string | null;
};

export async function createProject(
  prevState: ProjectActionState,
  formData: FormData,
) {
  const projectName = formData.get("projectName");
  console.log("hello from the server");
  if (!projectName) {
    return {
      success: false,
      error: "ProjectName is required",
    };
  }

  return {
    success: true,
    error: null,
  };
}

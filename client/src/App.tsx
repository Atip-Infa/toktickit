import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleCheck() {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await checkSystem();
      setCategories(res.categories);
      setState("success");
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to connect to TokTickIT API");
      setState("error");
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-4">
        TokTickIT <span className="text-success">IT Service Desk</span>
      </h1>

      <div className="mb-3">
        <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
          {state === "loading" ? "Loading…" : "Check System"}
        </button>
      </div>

      {state === "success" && (
        <div className="mt-4">
          <p className="fs-5 mb-3">
            System Status: <span className="fw-bold text-success">Online</span>
          </p>
          {categories.length > 0 && (
            <div>
              <p className="fw-bold mb-2">Supported Request Categories:</p>
              <ol className="list-group list-group-numbered">
                {categories.map((cat) => (
                  <li key={cat.id} className="list-group-item">
                    {cat.name}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="mt-4">
          <p className="fs-5 mb-2">
            System Status: <span className="fw-bold text-danger">Offline</span>
          </p>
          <div className="text-danger">{errorMsg}</div>
        </div>
      )}
    </div>
  );
}

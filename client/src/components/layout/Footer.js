import React from "react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-5 p-4 text-center">
      Copyright &copy; {new Date().getFullYear()} Dev Network.
      <hr /> Desingned with &hearts; by
      <a href="https://www.github.com/ananyachawla1">
        {" "}
        &nbsp;Ananya Chawla
      </a>
    </footer>
  );
}

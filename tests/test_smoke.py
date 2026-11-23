"""Verificações da instalação e da página inicial do bootstrap."""

from importlib import import_module
from pathlib import Path
import socket

from streamlit.testing.v1 import AppTest


def test_installed_package_can_be_imported():
    import_module("obi_tutor")


def test_initial_page_works_without_network(monkeypatch):
    def reject_connection(*args, **kwargs):
        raise AssertionError("A página inicial não deve acessar a rede.")

    monkeypatch.setattr(socket.socket, "connect", reject_connection)
    monkeypatch.setattr(socket, "create_connection", reject_connection)

    app_path = Path(__file__).resolve().parents[1] / "app.py"
    app = AppTest.from_file(str(app_path)).run()

    assert not app.exception
    assert app.title[0].value == "OBI Tutor"
    assert app.info[0].value == "Protótipo em desenvolvimento."

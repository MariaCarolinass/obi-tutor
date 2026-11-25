"""Verificação da importação do pacote Python."""

from importlib import import_module


def test_local_package_can_be_imported():
    import_module("obi_tutor")

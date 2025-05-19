system('start "x3d_html_runner1" cmd.exe /c "python -m http.server"');
system('start "x3d_html_runner2" cmd.exe /c "python new2way.py"');
system('start chrome "http://localhost:8000/"')
sim('vrtut2',1);
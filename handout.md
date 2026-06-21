# Grundlagen der Computergrafik: Wie ein Computer Bilder berechnet

Obwohl wir auf unseren Bildschirmen lebensechte 3D-Welten oder flache 2D-Fenster sehen, versteht der Computer eigentlich keine Bilder im menschlichen Sinn. Für ihn ist alles reine Mathematik. Jeder Buchstabe, jedes grafische Element und jedes 3D-Objekt wird aus den immer gleichen, grundlegenden Bausteinen zusammengesetzt.

-  Der Punkt (Vertex)
  Das absolute Fundament jeder Grafik ist der Punkt, in der Fachsprache Vertex (Plural: Vertices) genannt. Ein Vertex hat keine Ausdehnung, keine Farbe und keine Form. Er ist lediglich ein exakter mathematischer Ort in einem endlosen Koordinatensystem. In einer 2D-Umgebung hat er zwei Koordinaten, X für die Breite und Y für die Höhe. In 3D kommt eine dritte Koordinate hinzu, das Z für die Tiefe.

-  Die Kante (Edge)
  Wenn der Computer zwei Vertices durch eine gerade Linie miteinander verbindet, entsteht eine Kante, die sogenannte Edge. Diese Kanten helfen dabei, die Linien und Umrisse einer Form zu definieren. Sie haben ebenfalls noch keine Fläche, bilden aber das Drahtmodell (Wireframe) für spätere räumliche Objekte.

-  Die Fläche (Das Dreieck / Face)
  Verbindet man drei Vertices durch Kanten, entsteht die kleinste mögliche Fläche: Das Dreieck (Face oder Polygon). Der Grund, warum die Computergrafik auf Dreiecken und nicht etwa auf Quadraten basiert, liegt in einer simplen mathematischen Regel. Drei Punkte im Raum liegen immer exakt auf einer flachen, ebenen Fläche, man nennt sie koplanar. Hätte man ein Viereck aus vier Vertices, könnte man einen der Punkte im Raum verschieben, wodurch die Fläche in sich gebogen wäre. Dies wuerde zu Fehlern in der Berechnung fuehren. Moderne Grafikkarten sind hardwareseitig exakt darauf optimiert, Milliarden solcher Dreiecke fehlerfrei zu berechnen.

-  Auch 2D besteht aus Dreiecken
  Oft wird gedanklich zwischen flachem 2D wie einem Browserfenster und räumlichem 3D wie in Videospielen getrennt. Technisch gesehen nutzt ein modernes Betriebssystem jedoch exakt denselben grafischen Ablauf für beides. Um ein einfaches, flaches Rechteck auf dem Bildschirm zu zeichnen, klebt der Computer im Hintergrund einfach zwei Dreiecke an einer Kante aneinander. Fast alles, was hardwarebeschleunigt dargestellt wird, basiert im Kern auf diesen Dreiecken.

-  Das 3D-Gitter (Mesh)
  Um komplexe 3D-Objekte darzustellen, werden tausende bis Millionen dieser kleinen, flachen Dreiecke wie ein Mosaik lückenlos aneinandergefügt. Dieses zusammenhängende Gitter nennt man Mesh (Polygonnetz). Ein solches Mesh ist innen völlig hohl und beschreibt lediglich die Außenhülle eines Objekts. Je mehr Dreiecke ein Mesh besitzt, was man als Polycount bezeichnet, desto weicher, runder und detailreicher wirkt die Form. Ein hoher Polycount erfordert jedoch eine entsprechend höhere Rechenleistung.

-  Die Illusion von Tiefe (Beleuchtung und Shading)
  Ein Mesh allein sieht flach und unnatürlich aus, da unser Gehirn räumliche Tiefe erst durch das Zusammenspiel von Licht und Schatten richtig erkennt. Der Computer simuliert deshalb virtuelle Lichtquellen im digitalen Raum. Durch mathematische Programme, die sogenannten Shader, berechnet er für jedes einzelne Dreieck, in welchem Winkel das Licht darauf fällt. Zeigt die Fläche eines Dreiecks direkt zur Lichtquelle, wird sie hell gezeichnet. Ist sie abgewandt, liegt sie im Schatten. So wird dem flachen Monitor eine dreidimensionale Tiefe vorgetäuscht.

-  Der Bildschirm (Rasterisierung und Pixel)
  Ein physischer Monitor besteht nicht aus Dreiecken, sondern aus Millionen von winzigen, fest angeordneten quadratischen Bildpunkten, den Pixeln. Im allerletzten Schritt muss die Grafikkarte die mathematisch frei im Raum schwebenden 3D-Dreiecke in dieses starre 2D-Pixelraster übersetzen. Dieser Vorgang heißt Rasterisierung. Die Grafikkarte legt hierbei ein unsichtbares Raster über die Szene und prüft für jeden einzelnen Pixel, ob sein Zentrum innerhalb der Grenzen eines Dreiecks liegt und welche Farbe er dementsprechend annehmen muss. Dieser komplexe Prozess wird dutzende Male pro Sekunde für Millionen von Pixeln gleichzeitig ausgeführt, um ein flüssiges, sichtbares Bild zu erzeugen.
